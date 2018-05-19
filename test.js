/* eslint-env mocha */
const chai = require('chai')
chai.use(require('chai-as-promised'))

const Mnemonic = require('bitcore-mnemonic')
const { HDPrivateKey } = require('bitcore-lib')

const Wallet = require('./main')

chai.should()

describe('Wallet', () => {
  const INCORRECT_TYPE = 'this_type_does_not_exist'
  const CORRECT_TYPE = 'bitcoin_electrum_BIP39'
  const CORRECT_SECRET = new Mnemonic().toString()

  it('throws if no parameters are passed', () => {
    ;(() => new Wallet()).should.throw()
  })

  it('throws if incorrect wallet type is passed', () => {
    ;(() => new Wallet(INCORRECT_TYPE, CORRECT_SECRET)).should.throw()
  })

  it('does not throw if correct wallet type and secret is passed (BIP39)', () => {
    ;(() => new Wallet(CORRECT_TYPE, CORRECT_SECRET)).should.not.throw()
  })

  it('defaults to livenet network', () => {
    const wallet = new Wallet(CORRECT_TYPE, CORRECT_SECRET)
    wallet._network.constructor.name.should.equal('Network')
    wallet._network.name.should.equal('livenet')
  })

  it('switches to testnet network when used as option', () => {
    const wallet = new Wallet(CORRECT_TYPE, CORRECT_SECRET, { network: 'testnet' })
    wallet._network.constructor.name.should.equal('Network')
    wallet._network.name.should.equal('testnet')
  })

  describe('.create()', () => {
    describe('Bitcoin electrum BIP39', () => {
      const TYPE_ID = 'bitcoin_electrum_BIP39'
      const CURRENCY = 'BTC'
      const SECRET_TYPE = 'BIP39'
      it('creates a Wallet instance with the correct data', () => {
        const wallet = Wallet.create(TYPE_ID)
        wallet._type.currency.should.equal(CURRENCY)
        wallet._type.secretType.should.equal(SECRET_TYPE)
      })
    })

    describe('Bitcoin electrum BIP32', () => {
      it('creates a Wallet instance with the correct data', () => {
        const TYPE_ID = 'bitcoin_electrum_BIP32'
        const CURRENCY = 'BTC'
        const SECRET_TYPE = 'BIP32'

        const wallet = Wallet.create(TYPE_ID)
        wallet._type.currency.should.equal(CURRENCY)
        wallet._type.secretType.should.equal(SECRET_TYPE)
      })
    })
  })

  describe('Bitcoin electrum BIP39 type', () => {
    const TYPE_ID = 'bitcoin_electrum_BIP39'
    const INCORRECT_SECRET_SEED = 'i am not a correct secret seed'
    const mnemonic = new Mnemonic()
    const CORRECT_SECRET_SEED = mnemonic.toString()
    const DERIVED_HD_KEY = mnemonic.toHDPrivateKey()
    const PASSPHRASE = 'this is a passphrase'
    const DERIVED_HD_KEY_WITH_PASSPHRASE = mnemonic.toHDPrivateKey(PASSPHRASE)

    it('throws if no secret is provided', () => {
      ;(() => new Wallet(TYPE_ID)).should.throw()
    })

    it('throws if secret seed is not correct', () => {
      ;(() => new Wallet(TYPE_ID, INCORRECT_SECRET_SEED)).should.throw()
    })

    it('does not throw if secret seed is correct', () => {
      ;(() => new Wallet(TYPE_ID, CORRECT_SECRET_SEED)).should.not.throw()
    })

    it('derives the correct HD private key from mnemonic', async () => {
      const wallet = new Wallet(TYPE_ID, CORRECT_SECRET_SEED)
      await wallet._ensureInitialized()
      wallet._rootHDPrivateKey.constructor.name.should.equal('HDPrivateKey')
      wallet._rootHDPrivateKey.toString().should.equal(DERIVED_HD_KEY.toString())
    })

    it('derives the correct HD private key from mnemonic and passphrase', async () => {
      const wallet = new Wallet(TYPE_ID, {
        seed: CORRECT_SECRET_SEED,
        passphrase: PASSPHRASE
      })
      await wallet._ensureInitialized()
      wallet._rootHDPrivateKey.constructor.name.should.equal('HDPrivateKey')
      wallet._rootHDPrivateKey.toString().should.equal(DERIVED_HD_KEY_WITH_PASSPHRASE.toString())
    })
  })

  describe('Bitcoin electrum BIP32 type', () => {
    const TYPE_ID = 'bitcoin_electrum_BIP32'
    const INCORRECT_SECRET_KEY = 'i am not a correct secret key'
    const CORRECT_SECRET_KEY = new HDPrivateKey().toString()

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
      await wallet._ensureInitialized()
      wallet._rootHDPrivateKey.constructor.name.should.equal('HDPrivateKey')
      wallet._rootHDPrivateKey.toString().should.equal(CORRECT_SECRET_KEY)
    })
  })
})
