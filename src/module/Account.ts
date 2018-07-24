import * as $ from '../data/settings'
import TransactionStorage from './TransactionStorage'
import { IAddressTransaction } from '../lib/addresses'
import { ITransaction } from '../lib/transactions'

import ElectrumClient from '../tmp/electrum-client/main'
import * as bitcoin from 'bitcoinjs-lib'
import { EventEmitter } from 'events'
import RawTransactionStorage from './RawTransactionStorage'
import Address, { IAddress } from './Address'

// ----------------
// interfaces

export interface IAccount {
  initialize: () => Promise<void>
  getTransactions: () => ITransaction[]
  getUnusedAddress: (index?: number) => string
}

interface IAccountOptions {
  network?: bitcoin.Network
  gapLimit?: number
}

interface IAddressLocation {
  type: string
  index: number
}

interface IHistoryAndStatus {
  history: IAddressTransaction[]
  status: string | null
}

// ----------------
// bip32 account class

export default class Account extends EventEmitter implements IAccount {
  private _initialized: boolean
  private _network: bitcoin.Network
  private _gapLimit: number
  private _externalHDNode: bitcoin.HDNode
  private _changeHDNode: bitcoin.HDNode
  private _electrum?: ElectrumClient
  private _transactionStorage: TransactionStorage
  private _external: IAddress[]
  private _change: IAddress[]
  private _unusedAddresses: number

  constructor (
    accountHDNode: bitcoin.HDNode,
    rawTransactionStorage: RawTransactionStorage,
    electrum?: ElectrumClient,
    options: IAccountOptions = {}) {

    super()
    this._initialized = false
    this._electrum = electrum

    // init account HD nodes
    this._externalHDNode = accountHDNode.derive(0)
    this._changeHDNode = accountHDNode.derive(1)

    // init address-related props
    this._external = []
    this._change = []
    this._unusedAddresses = 0

    // options
    this._network = options.network || $.DEFAULT_NETWORK
    this._gapLimit = options.gapLimit || $.DEFAULT_GAP_LIMIT

    // init transaction storage
    const retrieveTransactionHex = this._electrum
    ? (hash: string): Promise<string> => this._electrum!.methods.blockchain_transaction_get(hash)
    : async (hash: string): Promise<string> => ''

    const isAddressOwned = (address: string) =>
      this._getAddressLocation(address).index > -1
    this._transactionStorage = new TransactionStorage(
      this._network,
      rawTransactionStorage,
      retrieveTransactionHex,
      isAddressOwned)

    // subscribe to address notifications
    if (this._electrum) {
      this._electrum.events.on('blockchain.scripthash.subscribe',
        async params => this._updateAddressHistoryById(params[0]))
    }
  }

  // ----------------
  // electrum calls

  private async _electrumScripthashMethod (method: string, address: IAddress, defaultValue: any): Promise<any> {
    return this._electrum
      ? this._electrum.methods[`blockchain_scripthash_${method}`](address.electrumID)
      : defaultValue
  }

  private async _electrumSubscribe (address: IAddress): Promise<string> {
    return this._electrumScripthashMethod('subscribe', address, '')
  }

  private async _electrumGetHistory (address: IAddress): Promise<IAddressTransaction[]> {
    return this._electrumScripthashMethod('getHistory', address, [])
  }

  // ----------------
  // helpers

  private _deriveHDNode (type: string, index: number): bitcoin.HDNode {
    return type === 'external'
      ? this._externalHDNode.derive(index)
      : this._changeHDNode.derive(index)
  }

  private _computeAddressStatus (history: IAddressTransaction[]): string | null {
    // electrumx.readthedocs.io/en/latest/protocol-basics.html#status
    if (!history.length) return null

    const concatenatedHistory = history.sort((a, b) => {
      if (a.height <= 0) return 1
      if (a.height === b.height) return 0
      return a.height > b.height ? 1 : -1
    }).reduce((out, tx) => `${out}${tx.tx_hash}:${tx.height}:`, '')

    return bitcoin.crypto.sha256(Buffer.from(concatenatedHistory)).toString('hex')
  }

  private _getAddressLocation (addressId: string): IAddressLocation {
    // returns the type and index of an address
    let type = 'none'
    let index: number

    // try 'external' type
    index = this._external.findIndex(address => address.id === addressId)

    if (index > -1) { // if found, set 'external' type
      type = 'external'
    } else { // if not found as 'external', try 'change' type
      index = this._change.findIndex(address => address.id === addressId)
      if (index > -1) type = 'change' // if found, set 'change' type
    }

    // if not found as neither type, return 'none' type (index is -1)

    return { type, index }
  }

  private _ensureInitialized (): void {
    if (!this._initialized) throw new Error('Account is not initialized yet!')
  }

  // ----------------
  // address operations

  private async _initAddress (address: IAddress): Promise<IAddress> {
    // if already subscribed, no need to pull history
    if (address.subscribed) return address

    const status = await this._electrumSubscribe(address)
    address.subscribed = true

    if (address.status !== status) Object.assign(address, await this._fetchAddressHistoryAndStatus(address))

    if (address.history.length === 0 && address.type === 'external') this._unusedAddresses++

    return address
  }

  private async _updateAddressHistoryById (id: string): Promise<void> {
    // updates the history of an address by id

    const addressLocation = this._getAddressLocation(id)
    const { index, type } = addressLocation

    const typeProp = `_${type}`
    const address: IAddress = this[typeProp][index]
    const wasUnused = address.history.length === 0

    Object.assign(address, await this._fetchAddressHistoryAndStatus(address))

    const isUsedNow = address.history.length !== 0

    if (wasUnused && isUsedNow && address.type === 'external') this._unusedAddresses--
  }

  // ----------------
  // address list operations

  private async _updateAddresses (): Promise<void> {
    const subscribeAddress = (address) => this._initAddress(address)

    // take care of not subscribed / outdated addresses
    await Promise.mapSeries(['_external', '_change'], key => Promise
      .map(this[key], subscribeAddress, { concurrency: $.ADDRESSES_UPDATE_CONCURRENCY })
      .then(result => this[key] = result))
  }

  private _addAddresses (type: string, amount: number): void {
    // creates and appends as many addresses as specified
    const typeProp = `_${type}`
    const length = this[typeProp].length
    const newAddresses = new Array(amount).fill(0).map((value, index) =>
      new Address(this._deriveHDNode(type, index + length), this._network, type))

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
      this[typeProp].slice(initialIndex).reverse().some((address, i) => {
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

  private async _fetchAddressHistoryAndStatus (address: IAddress): Promise<IHistoryAndStatus> {
    // retrieves history for an address (does not mutate local record)
    // then retrieves and stores all transactions' data

    const history: IAddressTransaction[] = await this._electrumGetHistory(address)
    const status: string | null = this._computeAddressStatus(history)

    await Promise.map(history,
      tx => this._transactionStorage.retrieveTransaction(tx.tx_hash, tx.height),
      { concurrency: $.TRANSACTION_RETRIEVAL_CONCURRENCY })

    return { history, status }
  }

  // ----------------
  // interface

  public async initialize (): Promise<void> {
    await this._syncAddresses()
    this._initialized = true
  }

  public getTransactions (): ITransaction[] {
    this._ensureInitialized()
    return this._transactionStorage.getTransactions()
  }

  public getNUnusedAddresses (): number {
    return this._unusedAddresses
  }

  public getUnusedAddress (index: number = 0): string {
    this._ensureInitialized()

    const nUnusedAdresses = this.getNUnusedAddresses()
    if (index > nUnusedAdresses - 1) throw new Error(`No unused address exists with index: ${index} (only ${nUnusedAdresses} available)`)

    let unusedI = 0
    const isUnusedIndex = address => {
      const isUnused = address.history.length === 0
      if (!isUnused) return false
      if (unusedI === index) return true
      unusedI++
      return false
    }

    return this._external.find(isUnusedIndex)!.id
  }
}
