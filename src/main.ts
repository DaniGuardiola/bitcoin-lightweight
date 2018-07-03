import { WALLET_TYPES, IWalletType } from './fixtures/wallet-types'

import * as tx from './lib/transactions'
import * as secret from './lib/secret'
import { AddressBook } from './class/AddressBook'

import * as Joi from 'joi'
import * as bitcoin from 'bitcoinjs-lib'

// setup bluebird promises
import * as _bluebirdPromise from 'bluebird'
import { EventEmitter } from 'events'
global.Promise = _bluebirdPromise

// ----------------
// constants

const WALLET_TYPE_LIST = Object.keys(WALLET_TYPES)
const DEFAULT_GAP_LIMIT = 20

// ----------------
// interfaces

/**
 * Wallet class interface
 */
interface IWallet {
  ready: () => Promise<void>
  getBalance: () => number
  notifications: EventEmitter
}

interface ICachedRawTransaction extends tx.IRawTransaction {
  hash: string
}

/**
 *  A lightweight bitcoin wallet
 */
export class Wallet implements IWallet {
  private _test: any
  private _initialized: boolean
  private _initializationPromise: Promise<void>
  private _type: IWalletType
  private _networkName: string
  private _network: bitcoin.Network
  private _gapLimit: number
  private _transactions: tx.ITransaction[]
  private _rawTransactions: ICachedRawTransaction[]
  private _balance: number
  private _addressBook: AddressBook

  public notifications: EventEmitter

  // ----------------
  // constructor

  /**
   * @param typeId Type of wallet
   * @param secret Secret of the wallet for authentication
   * @param options Optional parameters
   */
  constructor (typeId: string, secret: any, options: any = {}) {
    // validate and store wallet type
    typeId = Joi.attempt(typeId, Joi.string().valid(WALLET_TYPE_LIST).required())

    // get wallet type
    this._type = WALLET_TYPES[typeId]

    // validate and store secret input
    const initialSecret: secret.IBIP32Secret | secret.IBIP39Secret = Joi.attempt(secret, this._type.secretSchema)

    // validate and save options
    options = Joi.attempt(options, Joi.object({
      network: Joi.string().valid(['bitcoin', 'testnet']).default('bitcoin'),
      gapLimit: Joi.number().integer().positive().max(100).default(DEFAULT_GAP_LIMIT),
      __testDisableNetwork: Joi.bool().default(false)
    }))

    // testing options
    this._saveTestOptions(options)

    // save options
    this._networkName = options.network
    this._network = bitcoin.networks[options.network]
    this._gapLimit = options.gapLimit

    // TODO: init electrum client
    // if (!this._test.disableNetwork) this._electrum = new Electrum(53012, 'testnet.hsmiths.com', 'tls')

    // init data
    this._transactions = []
    this._rawTransactions = []
    this._balance = 0

    // notification events
    this.notifications = new EventEmitter()

    // IN PROGRESS: initialization
    this._initialized = false
    const seed = this[`_parse${this._type.secretType}Secret`]() // initialize secret
    this._addressBook = new AddressBook(seed, this._network, this._type.BIP32CoinIDs[this._networkName])
    this._initializationPromise = this._initializeWallet() // initialize wallet
    this._initializationPromise.then(() => this.notifications.emit('ready'))
  }

  private _saveTestOptions (options): void {
    this._test = {
      disableNetwork: options.__testDisableNetwork
    }
  }

  // ----------------
  // helpers

  _ensureInitialized () {
    if (!this._initialized) throw new Error('Wallet is not initialized yet')
  }

  // ----------------
  // lifecycle

  async _initializeWallet (): Promise<void> {
    // if (!this._test.disableNetwork) await this._electrum.connect() // TODO: connect to electrum
    // await this[`_initialize${this._type.secretType}Wallet`]() // TODO: initialize wallet

    this._initialized = true
  }

  // ----------------
  // transactions

  // TODO: move cache to lib
  private _getRawTransaction (hash: string): any {
    return this._rawTransactions.find((t: ICachedRawTransaction) => t.hash === hash)
  }

  // TODO: move cache to lib
  private _putRawTransaction (cacheRawTransaction: ICachedRawTransaction): void {
    this._rawTransactions.push(cacheRawTransaction)
  }

  private async _retrieveRawTransaction (hash: string): Promise<tx.IRawTransaction> {
    // - check cache
    const cached = this._getRawTransaction(hash)
    if (cached) {
      const cacheCopy = cached
      delete cacheCopy.hash
      return cacheCopy
    }

    // - retrieve
    // const hex = await this._electrum.blockchain.transaction.get(hash) // get from electrumx server
    const rawTransaction = tx.parseTransactionHex(`TODO: replace with 'hex'`) // parse
    this._putRawTransaction(Object.assign({}, rawTransaction, { hash })) // write in cache
    return rawTransaction
  }

  // TODO: move cache to lib
  private _getTransaction (hash: string): any {
    return this._transactions.find((t: tx.ITransaction) => t.hash === hash)
  }

  // TODO: move cache to lib
  private _putTransaction (transaction: tx.ITransaction): void {
    this._transactions.push(transaction)
  }

  private async _retrieveTransaction (hash: string, height: number): Promise<tx.ITransaction> {
    // - check cache
    const cached = this._getTransaction(hash)
    // TODO: handle height change (-1 / unconfirmed parents > 0 / confirmed parents in mempool > n / confirmed)
    if (cached) return Object.assign({}, cached)

    // - retrieve
    const rawTransaction = await this._retrieveRawTransaction(hash)
    const transactionData = await tx.retrieveTransactionData(hash, height, rawTransaction,
      hash => this._retrieveRawTransaction(hash), this._network)
    const parsedTransaction = tx.parseTransaction(transactionData,
      address => false) // TODO: implement isAddressOwned()
    this._putTransaction(Object.assign({}, parsedTransaction)) // write in cache

    return parsedTransaction
  }

  // ----------------
  // public interface

  async ready (): Promise<void> {
    if (!this._initialized) return this._initializationPromise
  }

  getBalance (): number {
    console.log('test')
    return 6
  }
}
