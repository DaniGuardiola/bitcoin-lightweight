/* eslint-env mocha */
const chai = require('chai')
chai.use(require('chai-as-promised'))

const Mnemonic = require('bitcore-mnemonic')

const Wallet = require('./main')

/* const should = */ chai.should()

// ----------------
// constants

describe('Wallet', () => {
  const INCORRECT_TYPE = 'this_type_does_not_exist'
  const CORRECT_TYPE = 'bitcoin_electrum_BIP39'
  const CORRECT_SECRET = new Mnemonic().toString()

  it('throws if no parameters are passed', () => {
    (() => new Wallet()).should.throw()
  })

  it('throws if incorrect wallet type is passed', () => {
    ;(() => new Wallet(INCORRECT_TYPE, CORRECT_SECRET)).should.throw()
  })

  it('does not throw if correct wallet type and secret is passed (BIP39)', () => {
    ;(() => new Wallet(CORRECT_TYPE, CORRECT_SECRET)).should.not.throw()
  })

  describe('Bitcoin electrum BIP39 type', () => {
    const TYPE_ID = 'bitcoin_electrum_BIP39'
    const INCORRECT_SECRET_SEED = 'i am not a correct secret'
    const CORRECT_SECRET_SEED = new Mnemonic().toString()

    it('throws if no secret is provided', () => {
      ;(() => new Wallet(TYPE_ID)).should.throw()
    })

    it('throws if secret seed is not correct', () => {
      ;(() => new Wallet(TYPE_ID, INCORRECT_SECRET_SEED)).should.throw()
    })

    it('does not throw if secret seed is correct', () => {
      ;(() => new Wallet(TYPE_ID, CORRECT_SECRET_SEED)).should.not.throw()
    })
  })
})
