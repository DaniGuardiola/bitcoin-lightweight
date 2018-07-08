import * as $ from '../settings'
import { IAddress, IAddressTransaction, deriveBIP49Address } from '../lib/addresses'
import TransactionStorage from './TransactionStorage'
import ElectrumClient from '../../tmp/dist/main'

import * as bitcoin from 'bitcoinjs-lib'
import { EventEmitter } from 'events'

// ----------------
// interfaces

export interface IAccount {
  _external: IAddress[]
  _change: IAddress[]
}

interface IOptions {
  network?: bitcoin.Network
  gapLimit?: number
}

interface IAddressLocation {
  type: string
  index: number
}

// ----------------
// bip32 account class

export default class Account extends EventEmitter implements IAccount {
  private _network: bitcoin.Network
  private _gapLimit: number
  private _externalHDNode: bitcoin.HDNode
  private _changeHDNode: bitcoin.HDNode
  private _electrum?: ElectrumClient
  private _transactionStorage: TransactionStorage
  public _external: IAddress[]
  public _change: IAddress[]

  constructor (accountHDNode: bitcoin.HDNode, electrum?: ElectrumClient, options: IOptions = {}) {
    super()
    this._electrum = electrum

    // init account HD nodes
    this._externalHDNode = accountHDNode.derive(0)
    this._changeHDNode = accountHDNode.derive(1)

    // init external and change props
    this._external = []
    this._change = []

    // options
    this._network = options.network || $.DEFAULT_NETWORK
    this._gapLimit = options.gapLimit || $.DEFAULT_GAP_LIMIT

    // init transaction storage
    const retrieveTransactionHex = this._electrum
    ? (hash: string): Promise<string> => this._electrum!.methods.blockchain_transaction_get(hash)
    : async (hash: string): Promise<string> => ''

    const isAddressOwned = (address: string) =>
      this._getAddressLocationFromId(address).index > -1
    this._transactionStorage = new TransactionStorage(this._network, retrieveTransactionHex, isAddressOwned)

    // subscribe to address notifications
    if (this._electrum) {
      this._electrum!.events.on('blockchain.scripthash.subscribe',
        async params => this._updateAddressHistoryById(params[0]))
    }
  }

  // ----------------
  // electrum calls

  private async _electrumSubscribe (scriptHash: string): Promise<string> {
    return this._electrum
      ? this._electrum.methods.blockchain_scripthash_subscribe(scriptHash)
      : ''
  }

  private async _electrumGetHistory (addressId: string): Promise<IAddressTransaction[]> {
    return this._electrum
      ? this._electrum.methods.blockchain_scripthash_getHistory(addressId)
      : []
  }

  // ----------------
  // helpers

  private _deriveHDNode (type: string, index: number): bitcoin.HDNode {
    return type === 'external'
      ? this._externalHDNode.derive(index)
      : this._changeHDNode.derive(index)
  }

  private _computeAddressStatus (history: IAddressTransaction[]): Buffer | null {
    // electrumx.readthedocs.io/en/latest/protocol-basics.html#status
    if (!history.length) return null

    const concatenatedHistory = history.sort((a, b) => {
      if (a.height <= 0) return 1
      if (a.height === b.height) return 0
      return a.height > b.height ? 1 : -1
    }).reduce((out, tx) => `${out}${tx.tx_hash}:${tx.height}:`, '')

    return bitcoin.crypto.sha256(Buffer.from(concatenatedHistory))
  }

  private _getAddressLocationFromId (addressId: string, type?: string): IAddressLocation {
    // returns the type and index of an address id

    const typeProp = `_${type}`

    // if type is specified
    if (type) {
      return {
        type,
        index: this[typeProp].findIndex(address => address.id === addressId)
      }
    }

    let index

    // try 'external' type
    type = 'external'
    index = this._getAddressLocationFromId(addressId, type).index

    if (index < 0) { // if not found as 'external', try 'change' type
      type = 'change'
      index = this._getAddressLocationFromId(addressId, type).index
    }

    // if not found, return false
    if (index < 0) return { type: 'none', index: -1 }

    return { type, index }
  }

  // ----------------
  // address operations

  private async _initAddress (address) {
    let status

    // if already subscribed, no need to pull history
    if (address.subscribed) return address

    const scriptHashBuffer = Buffer.alloc(address.scriptHash.length)
    address.scriptHash.copy(scriptHashBuffer)
    const scriptHash = Buffer.from(scriptHashBuffer.reverse()).toString('hex')
    status = await this._electrumSubscribe(scriptHash)
    address.subscribed = true

    if (address.status !== status) Object.assign(address, await this._fetchAddressHistory(scriptHash))

    return address
  }

  private async _updateAddressHistoryById (id: string) {
    // updates the history of an address by id (updates local record)

    const addressLocation = this._getAddressLocationFromId(id)
    const { index, type } = addressLocation

    const typeProp = `_${type}`

    await this._fetchAddressHistory(this[typeProp][index].id)

    Object.assign(this[typeProp][index], await this._fetchAddressHistory(this[typeProp][index].id))
  }

  // ----------------
  // address list operations

  private async _updateAddresses () {
    const subscribeAddress = address => this._initAddress(address)

    // take care of not subscribed / outdated addresses
    return Promise.mapSeries(['_external', '_change'], key => Promise
      .map(this[key], subscribeAddress, { concurrency: $.ADDRESSES_UPDATE_CONCURRENCY })
      .then(result => this[key] = result))
  }

  private _addAddresses (type: string, amount: number): void {
    // creates and appends as many addresses as specified
    const typeProp = `_${type}`
    const length = this[typeProp].length
    const newAddresses = new Array(amount).fill(0).map((value, index) =>
      deriveBIP49Address(this._deriveHDNode(type, index + length), type, this._network))

    this[typeProp] = this[typeProp].concat(newAddresses)
  }

  private _fillAddressGap (type?: string): boolean {
    // returns true if new addresses were added (in which case an update is needed)

    // fix for all types of addresses if type is not specified
    if (!type) {
      return ['external', 'change']
        .map(type => this._fillAddressGap(type))
        .some(hasAddressGap => !!hasAddressGap)
    }

    const typeProp = `_${type}`

    // get gap limit depending on the type
    const gapLimit = type === 'external'
      ? this._gapLimit
      : $.CHANGE_GAP_LIMIT

    // calculate missing addresses (gap size)
    let initialIndex = this[typeProp].length > gapLimit
      ? this[typeProp].length - gapLimit
      : 0
    let nMissingAddresses = 0

    if (this[typeProp].length < gapLimit) {
      nMissingAddresses = gapLimit - this[typeProp].length
    } else {
      const anyAddressUsed = this[typeProp].slice(initialIndex).reverse().some((address, i) => {
        if (address.history.length) {
          nMissingAddresses = gapLimit - i
          return true
        }
      })
    }

    // fill addresses
    if (nMissingAddresses) {
      this._addAddresses(type, nMissingAddresses)
      return true
    }
    return false
  }

  private async _syncAddresses (): Promise<void> {
    await this._updateAddresses()
    const hasAddressGap = this._fillAddressGap()
    if (hasAddressGap) return this._syncAddresses()
  }

  // ----------------
  // data retrieval

  private async _fetchAddressHistory (addressId) {
    // retrieves history for an address (does not mutate local record)
    // then retrieves and stores all transactions' data

    const history: IAddressTransaction[] = await this._electrumGetHistory(addressId)
    const status = this._computeAddressStatus(history)

    await Promise.map(history,
      tx => this._transactionStorage.retrieveTransaction(tx.tx_hash, tx.height),
      { concurrency: $.TRANSACTION_RETRIEVAL_CONCURRENCY })

    return { history, status }
  }

  // ----------------
  // interface

  public async initialize () {
    return this._syncAddresses()
  }

  public getTransactions () {
    return this._transactionStorage.getTransactions()
  }
}
