/* eslint-env mocha */
const chai = require('chai')
chai.use(require('chai-as-promised'))

const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')

const Wallet = require('./main')

chai.should()

describe('Wallet', () => {
  const INCORRECT_TYPE = 'this_type_does_not_exist'
  const CORRECT_TYPE = 'bitcoin_electrum_BIP39_BIP49'
  const CORRECT_SECRET = bip39.generateMnemonic()

  it('throws if no parameters are passed', () => {
    ;(() => new Wallet()).should.throw()
  })

  it('throws if incorrect wallet type is passed', () => {
    ;(() => new Wallet(INCORRECT_TYPE, CORRECT_SECRET)).should.throw()
  })

  it('does not throw if correct wallet type and secret is passed (BIP39)', () => {
    ;(() => new Wallet(CORRECT_TYPE, CORRECT_SECRET)).should.not.throw()
  })

  it('defaults to bitcoin (livenet) network', () => {
    const wallet = new Wallet(CORRECT_TYPE, CORRECT_SECRET)
    wallet._network.messagePrefix.should.equal('\u0018Bitcoin Signed Message:\n')
    wallet._network.pubKeyHash.should.equal(0x00)
    wallet._networkName.should.equal('bitcoin')
  })

  it('switches to testnet network when used as option', () => {
    const wallet = new Wallet(CORRECT_TYPE, CORRECT_SECRET, { network: 'testnet' })
    wallet._network.messagePrefix.should.equal('\u0018Bitcoin Signed Message:\n')
    wallet._network.pubKeyHash.should.equal(0x6f)
    wallet._networkName.should.equal('testnet')
  })

  describe('.create()', () => {
    describe('Bitcoin electrum BIP39_BIP49', () => {
      const TYPE_ID = 'bitcoin_electrum_BIP39_BIP49'
      const CURRENCY = 'BTC'
      const SECRET_TYPE = 'BIP39_BIP49'
      it('creates a Wallet instance with the correct data', () => {
        const wallet = Wallet.create(TYPE_ID)
        wallet._type.currency.should.equal(CURRENCY)
        wallet._type.secretType.should.equal(SECRET_TYPE)
      })
    })

    describe('Bitcoin electrum BIP49', () => {
      it('creates a Wallet instance with the correct data', () => {
        const TYPE_ID = 'bitcoin_electrum_BIP49'
        const CURRENCY = 'BTC'
        const SECRET_TYPE = 'BIP49'

        const wallet = Wallet.create(TYPE_ID)
        wallet._type.currency.should.equal(CURRENCY)
        wallet._type.secretType.should.equal(SECRET_TYPE)
      })
    })
  })

  describe('Bitcoin electrum BIP39_BIP49 type', () => {
    const TYPE_ID = 'bitcoin_electrum_BIP39_BIP49'
    const INCORRECT_SECRET_MNEMONIC = 'i am not a correct secret seed'
    const CORRECT_SECRET_MNEMONIC2 = bip39.generateMnemonic()
    const CORRECT_SECRET_MNEMONIC = 'attend ordinary entire myth leg utility flat jacket trade smart despair clerk'
    const seed = bip39.mnemonicToSeed(CORRECT_SECRET_MNEMONIC)
    const DERIVED_HD_NODE = bitcoin.HDNode.fromSeedBuffer(seed)
    const PASSPHRASE = 'this is a passphrase'
    const seedPassphrase = bip39.mnemonicToSeed(CORRECT_SECRET_MNEMONIC, PASSPHRASE)
    const DERIVED_HD_NODE_WITH_PASSPHRASE = bitcoin.HDNode.fromSeedBuffer(seedPassphrase)

    it('throws if no secret is provided', () => {
      ;(() => new Wallet(TYPE_ID)).should.throw()
    })

    it('throws if secret seed is not correct', () => {
      ;(() => new Wallet(TYPE_ID, INCORRECT_SECRET_MNEMONIC)).should.throw()
    })

    it('does not throw if secret seed is correct', () => {
      ;(() => new Wallet(TYPE_ID, CORRECT_SECRET_MNEMONIC)).should.not.throw()
    })

    it('derives the correct HD private key from mnemonic', async () => {
      const wallet = new Wallet(TYPE_ID, CORRECT_SECRET_MNEMONIC)
      await wallet.onReady()
      wallet._rootHDNode.constructor.name.should.equal('HDNode')
      wallet._rootHDNode.toString().should.equal(DERIVED_HD_NODE.toString())
    })

    it('derives the correct HD private key from mnemonic and passphrase', async () => {
      const wallet = new Wallet(TYPE_ID, {
        seed: CORRECT_SECRET_MNEMONIC,
        passphrase: PASSPHRASE
      })
      await wallet.onReady()
      wallet._rootHDNode.constructor.name.should.equal('HDNode')
      wallet._rootHDNode.toString().should.equal(DERIVED_HD_NODE_WITH_PASSPHRASE.toString())
    })
  })

  describe('Bitcoin electrum BIP49 type', () => {
    const TYPE_ID = 'bitcoin_electrum_BIP49'
    const INCORRECT_SECRET_KEY = 'i am not a correct secret key'
    const mnemonic = bip39.generateMnemonic()
    const seed = bip39.mnemonicToSeed(mnemonic)
    const hdNode = bitcoin.HDNode.fromSeedBuffer(seed)
    const CORRECT_SECRET_KEY = hdNode.toBase58()

    it('throws if no secret is provided', () => {
      ;(() => new Wallet(TYPE_ID)).should.throw()
    })

    it('throws if secret seed is not correct', () => {
      ;(() => new Wallet(TYPE_ID, INCORRECT_SECRET_KEY)).should.throw()
    })

    it('does not throw if secret seed is correct', () => {
      ;(() => new Wallet(TYPE_ID, CORRECT_SECRET_KEY)).should.not.throw()
    })

    it('stores the correct HD private key', async () => {
      const wallet = new Wallet(TYPE_ID, CORRECT_SECRET_KEY)
      await wallet.onReady()
      wallet._rootHDNode.constructor.name.should.equal('HDNode')
      wallet._rootHDNode.toString().should.equal(CORRECT_SECRET_KEY)
    })
  })
})
