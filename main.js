const WALLET_TYPES = require('./dictionaries/wallet-types')

const createWallet = require('./lib/create-wallet')
const Joi = require('./lib/joi')
const Promise = require('bluebird')
const Electrum = require('electrum-client')
const sha256 = require('js-sha256')

// TODO(bitcoinjs): replace with bip39
const Mnemonic = require('bitcore-mnemonic')
// TODO(bitcoinjs): replace with bitcoinjs-lib
const { HDPrivateKey, Networks, Transaction } = require('bitcore-lib')
const bitcoin = require('bitcoinjs-lib')

// ----------------
// constants

const WALLET_TYPE_LIST = Object.keys(WALLET_TYPES)
const DEFAULT_GAP_LIMIT = 20
const CHANGE_GAP_LIMIT = 5
const ADDRESSES_UPDATE_CONCURRENCY = 1 // 20
const TRANSACTION_RETRIEVAL_CONCURRENCY = 5

/**
 * Abstracts the logic of wallets, supporting multiple types for multiple currencies.
 *
 * @param {string} type Type of wallet
 * @param {string|object} secret Private information that provides full access to the wallet
 */
module.exports = class Wallet {
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

    // TODO(bitcoinjs): bitcoin.networks.testnet
    this._network = Networks.get(options.network)
    this._gapLimit = options.gapLimit

    // init electrum client
    this._electrum = new Electrum(53012, 'testnet.hsmiths.com', 'tls')

    // initialization
    this._initialized = false
    this._initializationPromise = this._initialize()
  }

  // ----------------
  // wallet creation

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

  // ----------------
  // initialization

  _ensureInitialized () {
    // throws if wallet is not initialized

    // if not initialized, throw an error
    if (!this._initialized) throw new Error('Wallet is not initialized yet')
  }

  _initializeBIP39Secret () {
    // github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

    // true => string (seed) format
    // false => object (seed + optional passphrase) format
    const stringFormat = typeof this._secret === 'string'

    const seed = stringFormat
      ? this._secret
      : this._secret.seed
    const passphrase = stringFormat
      ? null
      : this._secret.passphrase

    // remove passphrase from context
    delete this._secret.passphrase

    // derive and store HD private key from mnemonic
    // TODO(bitcoinjs): https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/bip32.js#L15
    const mnemonic = new Mnemonic(seed)
    this._rootHDPrivateKey = mnemonic.toHDPrivateKey(passphrase, this._network)
  }

  _initializeBIP32Secret () {
    // github.com/bitcoin/bips/blob/master/bip-0032.mediawiki

    // store HD private key
    // TODO(bitcoinjs): bitcoin.HDNode.fromBase58(xpriv, bitcoin.networks.testnet)
    this._rootHDPrivateKey = new HDPrivateKey(this._secret, this._network) // TODO: not sure if network works here
  }

  async _onInitialized () {
    // can be used in async functions by adding: await this._onInitialized()
    // statements after it will be run only if/once wallet is initialized

    // if not initialized, wait for initialization to be over
    if (!this._initialized) return this._initializationPromise
  }

  async _initializeBIP44Wallet () {
    // github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
    const BIP44CoinType = this._type.BIP44CoinTypes[this._network.name]

    // get BIP 44 main account, external and change HD keys
    // TODO(bitcoinjs): hdNode.derivePath('m/44'/1'/0')
    const mainAccountHDPrivateKey = this._rootHDPrivateKey.derive(`m/44'/${BIP44CoinType}'/0'`)
    this._mainAccountHDPrivateKeys = {
      // TODO(bitcoinjs): hdNode.derive(1)
      external: mainAccountHDPrivateKey.derive(0),
      change: mainAccountHDPrivateKey.derive(1)
    }

    // generate the initial external and change addresses
    this._addresses = {
      external: new Array(this._gapLimit).fill().map((value, index) => this._deriveAddress('external', index)),
      change: new Array(CHANGE_GAP_LIMIT).fill().map((value, index) => this._deriveAddress('change', index))
    }

    // initialize transactions object
    this._transactions = {}

    // subscribe to address updates
    this._electrum.subscribe.on('blockchain.address.subscribe', async params => {
      await this._updateAddressHistoryById(params[0])
      return this._update()
    })

    // run the initial update
    return this._update()
  }

  // ----------------
  // addresses

  _deriveAddress (type, index) {
    // derives an address from the relevant HD key for a given index

    const hdPrivateKey = this._mainAccountHDPrivateKeys[type].derive(index)
    const privateKey = hdPrivateKey.privateKey
    const publicKey = hdPrivateKey.publicKey
    const address = privateKey.toAddress()
    const id = address.toString()

    // initial address object
    return {
      id,
      type,
      privateKey,
      publicKey,
      address,
      subscribed: false,
      status: null,
      history: [],
      balance: 0
    }
  }

  _addAddresses (type, amount) {
    // creates and appends as many addresses as specified
    const length = this._addresses[type].length
    const newAddresses = new Array(amount).fill().map((value, index) =>
      this._deriveAddress(type, index + length))
    this._addresses[type] = this._addresses[type].concat(newAddresses)
  }

  _fixAddressGap (type) {
    // returns true if new addresses were added (in which case an update is needed)

    // fix for all types of addresses if type is not specified
    if (!type) return Promise.map(['external', 'change'], type => this._fixAddressGap(type)).then(arr => arr.some(r => r === true))

    // get gap limit depending on the type
    const gapLimit = type === 'external'
      ? this._gapLimit
      : CHANGE_GAP_LIMIT

    // calculate missing addresses (gap size)
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

    // fill addresses
    if (nMissingAddresses) {
      this._addAddresses(type, nMissingAddresses)
      return true
    }
  }

  _computeAddressStatus (history) {
    // electrumx.readthedocs.io/en/latest/protocol-basics.html#status
    if (!history.length) return null
    return sha256(history
      .sort((a, b) => {
        if (a.height <= 0) return 1
        if (a.height === b.height) return 0
        return a.height > b.height ? 1 : -1
      })
      .reduce((out, tx) => `${out}${tx.tx_hash}:${tx.height}:`, ''))
  }

  _getAddressLocationFromId (addressId, type) {
    // returns the type and index of an address id

    // if type is specified
    if (type) {
      return {
        type,
        index: this._addresses[type].findIndex(address => address.id === addressId)
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

    // if not found, throw an error
    if (index < 0) throw new Error(`Address '${addressId}' could not be found`)

    return { type, index }
  }

  async _updateAddressHistoryById (id, type) {
    // updates the history of an address by id (updates local record)

    const addressLocation = this._getAddressLocationFromId(id, type)
    const { index } = addressLocation
    type = addressLocation.type

    await this._fetchAddressHistory(this._addresses[type][index].id)

    Object.assign(this._addresses[type][index], await this._fetchAddressHistory(this._addresses[type][index].id))
  }

  async _fetchAddressHistory (addressId) {
    // retrieves history for an address (does not mutate local record)
    // then retrieves and stores all transactions' data

    const history = await this._electrum.blockchain.address.getHistory(addressId)
    const status = this._computeAddressStatus(history)

    await Promise.mapSeries(history,
      tx => {
        console.log(tx)
        return this._retrieveTransaction(tx.tx_hash)
      },
      { concurrency: TRANSACTION_RETRIEVAL_CONCURRENCY })

    return { history, status }
  }

  async _updateAddresses (type) {
    // update all types of addresses if type is not specified
    if (!type) return Promise.mapSeries(['external', 'change'], type => this._updateAddresses(type))

    // take care of not subscribed / outdated addresses
    this._addresses[type] = await Promise.map(this._addresses[type], async address => {
      let status
      if (!address.subscribed) {
        console.log('ADDRESS', address.id)
        status = await this._electrum.blockchain.address.subscribe(address.id)
        address.subscribed = true
      } else return address // if already subscribed, no need to pull history

      if (address.status !== status) Object.assign(address, await this._fetchAddressHistory(address.id))

      return address
    }, { concurrency: ADDRESSES_UPDATE_CONCURRENCY })
  }

  // ----------------
  // transaction

  async _retrieveTransaction (hash) {
    const hex = await this._electrum.blockchain.transaction.get(hash)
    console.log(hex)
    const transaction = new Transaction(Buffer.from(hex, 'hex'))

    const { inputs, outputs } = transaction

    const bitcoinjs = bitcoin.Transaction.fromHex(Buffer.from(hex, 'hex'))

    console.log(bitcoinjs)
    console.log(bitcoinjs.getId())
    console.log(bitcoinjs.ins[0].hash.toString('hex'))
    console.log(bitcoinjs.ins[0].script.toString('hex'))
    console.log(transaction.toJSON())
    // WIP: process scripts somehow

    if (inputs.length > 1) {
      const errorMessage =
        `Whoops! fairwallet-lib doesn't know how to deal with transactions with more than 1 input`
      return Promise.reject(new Error(errorMessage))
    } else if (!inputs.length) {
      const errorMessage =
        `No inputs! :(`
      return Promise.reject(new Error(errorMessage))
    }

    const input = inputs[0]

    console.log('input.script', input.script)

    this._transactions[hash] = {
      hash,
      hex,
      transaction,
      amount: 'TODO',
      direction: 'TODO',
      peer: 'TODO',
      height: 'TODO'
    }
  }

  // ----------------
  // lifecycle

  async _initialize () {
    // initialize secret
    ;({
      BIP39: () => this._initializeBIP39Secret(),
      BIP32: () => this._initializeBIP32Secret()
    })[this._type.secretType]()

    // connect to electrum
    await this._electrum.connect()

    // initialize wallet
    await ({
      BIP39: () => this._initializeBIP44Wallet(),
      BIP32: () => this._initializeBIP44Wallet()
    })[this._type.secretType]()

    // update initialization-related state props
    this._initialized = true
    this._initializationPromise = false
  }

  async _update () {
    // update all addresses
    await this._updateAddresses()

    // check gap and fill it if needed
    const newAddresses = await this._fixAddressGap()

    // update again if new addresses were added
    if (newAddresses) return this._update()
  }

  // ----------------
  // interface

  /**
   * Resolves once wallet is up-to-date and ready to be used (or immediately if that's already the current state)
   *
   * @async
   * @return {Promise} Resolves only once ready
   */
  async onReady () {
    return this._onInitialized()
  }

  /**
   * @return {{
   *   external: array<{id: string, balance: number}>,
   *   change: array<{id: string, balance: number}>
   * }}
   * Addresses and their current balances
   */
  getAddresses () {
    this._ensureInitialized()

    const normalizeAddress = address => {
      const { id, balance } = address
      return { id, balance }
    }

    return {
      external: this._addresses.external.map(normalizeAddress),
      change: this._addresses.change.map(normalizeAddress)
    }
  }

  /**
   * Retrieves the current wallet balance and the estimation for the secondary currency
   *
   * @async
   * @param  {object} options Options for the getBalance operation
   * @param  {string} options.secondaryCurrency Overwrites the secondary currency setting
   * @param  {string} options.withSymbol Returns strings with the currency symbol appended instead of just numbers for balances
   *
   * @return {Promise<{
   *   balance: number,
   *   secondary: {
   *     balance: number,
   *     currency: string
   *   }
   * }>} Object that contains the balance of the wallet currency and the secondary currency information
   */
  async getBalance (options = {}) {
    this._ensureInitialized()
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
    this._ensureInitialized()
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
