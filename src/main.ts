import * as $ from './settings'
import { WALLET_TYPES, IWalletType } from './fixtures/wallet-types'

import { IBIP32Secret, IBIP39Secret, parseBIP39Secret } from './lib/secret'
import BIP32Wallet from './module/BIP32Wallet'

import * as Joi from 'joi'
import * as bitcoin from 'bitcoinjs-lib'
import ElectrumClient from '../tmp/electrum-client/main'

// setup bluebird promises
import * as _bluebirdPromise from 'bluebird'
import { EventEmitter } from 'events'
import { ITransaction } from './lib/transactions'
import { convert } from './lib/units'
global.Promise = _bluebirdPromise

// ----------------
// constants

const WALLET_TYPE_LIST = Object.keys(WALLET_TYPES)

// ----------------
// interfaces

/**
 * Wallet class interface
 */
interface IWallet {
  ready: () => Promise<void>
  getBalance: () => number
}

/**
 *  A lightweight bitcoin wallet
 */
export default class Wallet extends EventEmitter implements IWallet {
  private _test: any
  private _initialized: boolean
  private _initializationPromise: Promise<void>
  private _type: IWalletType
  private _networkName: string
  private _network: bitcoin.Network
  private _gapLimit: number
  private _electrum?: ElectrumClient
  private _balance: number
  private _bip32Wallet: BIP32Wallet

  // ----------------
  // constructor

  /**
   * @param typeId Type of wallet
   * @param secret Secret of the wallet for authentication
   * @param options Optional parameters
   */
  constructor (typeId: string, secret: any, options: any = {}) {
    super() // initialize event emitter

    // validate and store wallet type
    typeId = Joi.attempt(typeId, Joi.string().valid(WALLET_TYPE_LIST).required())

    // get wallet type
    this._type = WALLET_TYPES[typeId]

    // validate and store secret input
    Joi.attempt(secret, this._type.secretSchema)

    // validate and save options
    options = Joi.attempt(options, Joi.object({
      network: Joi.string().valid(['bitcoin', 'testnet']).default('bitcoin'),
      gapLimit: Joi.number().integer().positive().max(100).default($.DEFAULT_GAP_LIMIT),
      __testDisableNetwork: Joi.bool().default(false)
    }))

    // testing options
    this._saveTestOptions(options)

    // save options
    this._networkName = options.network
    this._network = bitcoin.networks[options.network]
    this._gapLimit = options.gapLimit

    // init electrum client
    if (!this._test.disableNetwork) {
      this._electrum = new ElectrumClient('testnet.hsmiths.com', 53012, 'tls')
    }

    // init data
    this._balance = 0

    // IN PROGRESS: initialization
    this._initialized = false
    const bip32Seed = parseBIP39Secret(secret.seed) // get bip32 seed from bip39 phrase
    const bip32CoinId = this._type.BIP32CoinIDs[this._networkName] // get BIP32 coin id
    this._bip32Wallet = new BIP32Wallet(bip32Seed, this._network, bip32CoinId, this._electrum)
    this._initializationPromise = this._initializeWallet() // initialize wallet and store its promise
    this._initializationPromise.then(() => this.emit('ready')) // emit the 'ready' event
  }

  private _saveTestOptions (options): void {
    this._test = {
      disableNetwork: !!options.__testDisableNetwork
    }
  }

  // ----------------
  // helpers

  private _ensureInitialized (): void {
    if (!this._initialized) throw new Error('Wallet is not initialized yet')
  }

  // ----------------
  // lifecycle

  private async _initializeWallet (): Promise<void> {
    if (!this._test.disableNetwork) await this._electrum!.connect() // connect to electrum
    await this._bip32Wallet.initialize() //  initialize wallet

    this._initialized = true
  }

  // ----------------
  // public interface

  public static convert (n: number, unit: string) {
    return convert(n, unit)
  }

  public async ready (): Promise<void> {
    if (!this._initialized) return this._initializationPromise
  }

  public getTransactions (): ITransaction[] {
    this._ensureInitialized()
    return this._bip32Wallet.getTransactions()
  }

  public getReceiveAddress (): string {
    // TODO: rotate in each call?
    return this._bip32Wallet.mainAccount.getUnusedAddress()
  }

  // TODO
  public getBalance (): number {
    return 6
  }
}
