const WALLET_TYPES = require('./dictionaries/wallet-types')

const createWallet = require('./lib/create-wallet')
const Joi = require('./lib/joi')

const Mnemonic = require('bitcore-mnemonic')
const {
  HDPrivateKey,
  Networks
} = require('bitcore-lib')

// ----------------
// constants

const WALLET_TYPE_LIST = Object.keys(WALLET_TYPES)

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
  static async create (type, options = {}) {
    const { secret } = await createWallet[type](options)
    return new Wallet(type, secret)
  }

  constructor (typeId, secret, options = {}) {
    // validate and store wallet type
    typeId = Joi.attempt(typeId,
      Joi.string().valid(WALLET_TYPE_LIST).required())

    this._type = WALLET_TYPES[typeId]

    // validate and store secret
    this._secret = Joi.attempt(secret, this._type.secretSchema)

    // validate and store options
    options = Joi.attempt(options,
      Joi.object({
        network: Joi.string().valid(['livenet', 'testnet']).default('livenet')
      }))

    this._network = Networks.get(options.network)

    // initialization
    this._initialized = false
    this._initializationPromise = this._initialize()
  }
  async _ensureInitialized () {
    // this method is intended to be used at the start of any method that needs the wallet
    // to be already initialized

    // it can be used in async functions by adding this at the top: await this._ensureInitialized()

    // this will ensure that the function will only be run after initialization

    // TODO: include timeout?
    if (this._initialized) return

    if (!this._initializationPromise) this._initializationPromise = this._initialize()

    return this._initializationPromise
  }

  async _initialize () {
    // TODO: include timeout?

    // initialize secret
    const secretInitialization = {
      BIP39: () => this._initializeBIP39(),
      BIP32: () => this._initializeBIP32()
    }[this._type.secretType]

    if (!secretInitialization) throw new Error(`Unknown secret protocol "${this._type.secretType}"`)

    secretInitialization()

    // update initialization-related state props
    this._initialized = true
    this._initializationPromise = false
  }

  async _initializeBIP39 () {
    const stringFormat = typeof this._secret === 'string'

    const seed = stringFormat ? this._secret : this._secret.seed
    const passphrase = stringFormat ? null : this._secret.passphrase

    // derive and store HD private key from mnemonic
    const mnemonic = new Mnemonic(seed)
    this._hdPrivateKey = mnemonic
      .toHDPrivateKey(passphrase, this._network)
  }

  async _initializeBIP32 () {
    this._hdPrivateKey = new HDPrivateKey(this._secret, this._network) // TODO: not sure if network works here
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
