const WALLET_TYPES = require('./dictionaries/wallet-types')

const createWallet = require('./lib/create-wallet')
const Joi = require('./lib/joi')
const Promise = require('bluebird')
const Electrum = require('electrum-client')
const sha256 = require('js-sha256')

const Mnemonic = require('bitcore-mnemonic')
const {HDPrivateKey, Networks} = require('bitcore-lib')

// ----------------
// constants

const WALLET_TYPE_LIST = Object.keys(WALLET_TYPES)
const DEFAULT_GAP_LIMIT = 20
const CHANGE_GAP_LIMIT = 5
const ADDRESSES_UPDATE_CONCURRENCY = 20

/**
 * Abstracts the logic of wallets, supporting multiple types for multiple currencies.
 *
 * @param {string} type Type of wallet
 * @param {string|object} secret Private information that provides full access to the wallet
 */
module.exports = class Wallet {
  /**
   * Creates a new wallet
   *
   * @param  {string} type    Wallet type
   * @param  {object} options Options for wallet creation
   * @return {Wallet}         Wallet instance
   */
  static create (type, options = {}) {
    const {secret} = createWallet[type](options)
    return new Wallet(type, secret)
  }

  constructor (typeId, secret, options = {}) {
    // validate and store wallet type
    typeId = Joi.attempt(typeId, Joi.string().valid(WALLET_TYPE_LIST).required())

    this._type = WALLET_TYPES[typeId]

    // validate and store secret
    this._secret = Joi.attempt(secret, this._type.secretSchema)

    // validate and store options
    options = Joi.attempt(options, Joi.object({
      network: Joi.string().valid(['livenet', 'testnet']).default('livenet'),
      gapLimit: Joi.number().integer().positive().max(100).default(DEFAULT_GAP_LIMIT)
    }))

    this._network = Networks.get(options.network)
    this._gapLimit = options.gapLimit

    // init electrum client
    this._electrum = new Electrum(53012, 'testnet.hsmiths.com', 'tls')

    // initialization
    this._initialized = false
    this._initializationPromise = this._initialize()
  }

  async _ensureInitialized () {
    // this method can be used in async functions by adding this at the top: await this._ensureInitialized()
    // this will ensure that the function will only be run after initialization

    if (this._initialized) return

    if (!this._initializationPromise) this._initializationPromise = this._initialize()

    return this._initializationPromise
  }

  async _initialize () {
    // TODO: include timeout?

    // initialize secret;
    ;({
      BIP39: () => this._initializeBIP39Secret(),
      BIP32: () => this._initializeBIP32Secret()
    })[this._type.secretType]()

    // connect to electrum
    await this._electrum.connect()

    // initialize wallet;
    await ({
      BIP39: () => this._initializeBIP44Wallet(),
      BIP32: () => this._initializeBIP44Wallet()
    })[this._type.secretType]()

    // update initialization-related state props
    this._initialized = true
    this._initializationPromise = false
  }

  _initializeBIP39Secret () {
    const stringFormat = typeof this._secret === 'string'

    const seed = stringFormat
      ? this._secret
      : this._secret.seed
    const passphrase = stringFormat
      ? null
      : this._secret.passphrase

    // derive and store HD private key from mnemonic
    const mnemonic = new Mnemonic(seed)
    this._rootHDPrivateKey = mnemonic.toHDPrivateKey(passphrase, this._network)
  }

  _initializeBIP32Secret () {
    this._rootHDPrivateKey = new HDPrivateKey(this._secret, this._network) // TODO: not sure if network works here
  }

  async _initializeBIP44Wallet () {
    // TODO: optionally load from storage and update addresses from that

    const BIP44CoinType = this._type.BIP44CoinTypes[this._network.name]

    // get BIP 44 main account, external and change HD keys
    const mainAccountHDPrivateKey = this._rootHDPrivateKey.derive(`m/44'/${BIP44CoinType}'/0'`)
    this._mainAccountHDPrivateKeys = {
      external: mainAccountHDPrivateKey.derive(0),
      change: mainAccountHDPrivateKey.derive(1)
    }

    // generate the initial external and change addresses
    this._addresses = {
      external: new Array(this._gapLimit).fill().map((value, index) => this._deriveAddress('external', index)),
      change: new Array(CHANGE_GAP_LIMIT).fill().map((value, index) => this._deriveAddress('change', index))
    }

    // subscribe to address updates
    this._electrum.subscribe.on('blockchain.address.subscribe', async params => {
      await this._updateAddressHistoryById(params[0])
      return this._update()
    })

    // run the initial update
    return this._update()
  }

  _deriveAddress (type, index) {
    const hdPrivateKey = this._mainAccountHDPrivateKeys[type].derive(index)
    const privateKey = hdPrivateKey.privateKey
    const publicKey = hdPrivateKey.publicKey
    const address = privateKey.toAddress()
    const id = address.toString()

    return {
      type,
      privateKey,
      publicKey,
      address,
      id,
      subscribed: false,
      status: null,
      history: []
    }
  }

  _fillAddresses (type, amount) {
    const length = this._addresses[type].length
    const newAddresses = new Array(amount).fill().map((value, index) =>
      this._deriveAddress(type, index + length))
    this._addresses[type] = this._addresses[type].concat(newAddresses)
  }

  _computeAddressStatus (history) {
    if (!history.length) return null
    return sha256(history.reduce((out, tx) => `${out}${tx.tx_hash}:${tx.height}:`, ''))
  }

  _getAddressLocationFromId (addressId, type) {
    // if type is specified
    if (type) {
      return {
        type,
        index: this._addresses[type].findIndex(address => address.id === addressId)
      }
    }

    let index

    // try external
    type = 'external'
    index = this._getAddressLocationFromId(addressId, type).index
    if (index < 0) { // if not, it must be change
      type = 'change'
      index = this._getAddressLocationFromId(addressId, type).index
    }

    return { type, index }
  }

  async _updateAddressHistoryById (id, type) {
    const addressLocation = this._getAddressLocationFromId(id, type)
    const { index } = addressLocation
    type = addressLocation.type

    this._addresses[type][index] = await this._updateAddressHistory(this._addresses[type][index])
  }

  async _updateAddressHistory (address) {
    address.history = await this._electrum.blockchain.address.getHistory(address.id)
    address.status = this._computeAddressStatus(address.history)
    address.updated = true

    return address
  }

  async _updateAddresses (type) {
    // update all types of addresses if type is not specified
    if (!type) return Promise.map(['external', 'change'], type => this._updateAddresses(type))

    // take care of outdated / not subscribed addresses
    this._addresses[type] = await Promise.map(this._addresses[type], async address => {
      let status
      if (!address.subscribed) {
        status = await this._electrum.blockchain.address.subscribe(address.id)
        address.subscribed = true
      } else return address // if already subscribed, no need to pull history

      if (address.status !== status) {
        address = await this._updateAddressHistory(address)
      }
      return address
    }, { concurrency: ADDRESSES_UPDATE_CONCURRENCY })
  }

  // returns true if new addresses were added (in which case an update is needed)
  async _fixGap (type) {
    // fix for all types of addresses if type is not specified
    if (!type) return Promise.map(['external', 'change'], type => this._fixGap(type)).then(arr => arr.some(r => r === true))

    const gapLimit = type === 'external'
      ? this._gapLimit
      : CHANGE_GAP_LIMIT

    // check gap and fill it if needed
    let initialIndex = this._addresses[type].length > gapLimit
      ? this._addresses[type].length - gapLimit
      : 0
    let nMissingAddresses = 0

    this._addresses[type].slice(initialIndex).reverse().some((address, i) => {
      if (address.history.length) {
        nMissingAddresses = gapLimit - i
        return true
      }
    })

    if (nMissingAddresses) {
      this._fillAddresses(type, nMissingAddresses)
      return true
    }
  }

  async _update () {
    // update all addresses
    await this._updateAddresses()

    // check gap and fill it if needed
    const newAddresses = await this._fixGap()

    // update again if new addresses were added
    if (newAddresses) return this._update()
  }

  /**
   * Retrieves the current wallet balance and the estimation for the secondary currency
   *
   * @async
   * @param  {object} options Options for the getBalance operation
   * @param  {string} options.secondaryCurrency Overwrites the secondary currency setting
   * @param  {string} options.withSymbol Returns strings with the currency symbol appended instead of just numbers for balances
   *
   * @return {Promise<{balance: number, secondary: {balance: number, currency: string}}>} Object that contains the balance of the wallet currency and the secondary currency information
   */
  async getBalance (options = {}) {
    /*
      Using electrum-client, either:
      - retrieve balances for all addresses
      - calculate balance from the history

      The latter is probably the best option, to reduce bandwith and improve offline resilience.

      The balance should be stored in the local database and then updated everytime new transactions
      are pulled for the wallet's addresses.

      Formatting options (like returning strings with an appended currency symbol with i18n instead of
      just the numbers) should be included.
    */
  }

  async getTransactionHistory (options = {}) {
    /*
      Using electrum-client, retrieve all historic transactions with all the data for all of the
      wallet's addresses.

      The history should be stored in the local database and updated everytime new transactions are
      pulled.

      There should be pagination based on either:
      - Number of transaction from the start
      - Id of the last transaction pulled (the most recent or the oldest depending on direction)

      There shouldn't be paagination based on inverse number of transaction because this could cause
      offset problems when a transaction is made inbetween pages.

      This method might include filtering options to facilitate search.

      Additionally, if non-blockchain metadata is stored in owned servers, the appropiate requests should
      be made (with proper cache).

      Also we might want to include the option to let the user store non-blockchain transaction metadata
      locally, so all of this data should be combined properly. We might want to do it in an asynchronous fashion
      to allow for optimal app responsiveness (e. g. displaying pure blockchain tx data first, and then updating
      with additional metadata when ready).

      We might want to split this into different methods or provide a different async interface, as promises only
      fullfill once and that's it, while this would require different stages. Might be worth it to consider the use
      of observables (reactivex.io), streams or similar.

      Formatting options (like returning strings with an appended currency symbol with i18n instead of
      just the numbers) should be included.
    */
  }
}

// TODO: user-friendly error messages instead of Joi's? https://github.com/hapijs/joi/issues/546
