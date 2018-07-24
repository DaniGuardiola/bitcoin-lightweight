/* eslint-env mocha */
const chai = require('chai')
chai.use(require('chai-as-promised'))

const tx = require('../dist/node/lib/transactions')

const FIXTURES = require('./fixtures/transactions')

chai.should()

const shorten = (string, length) =>
  `${string.substr(0, length)}${string.length <= length ? '' : '...'}`

describe('transactions', () => {
  describe('parseTransactionHex', () => {
    const fixtures = FIXTURES.hexToTransaction
    describe('correctly parses hex-serialized transactions', () => {
      fixtures.pass.forEach(fixture => {
        it(shorten(fixture.input.toString(), 35), () => {
          const { input, output } = fixture
          const result = tx.parseTransactionHex(input)
          output.should.deep.equal(result)
        })
      })
    })

    describe('fails to parse malformed hex-serialized transactions', () => {
      fixtures.fail.forEach(fixture => {
        it(shorten(fixture.toString(), 35), () => {
          (() => tx.parseTransactionHex(fixture)).should.throw()
        })
      })
    })
  })

  // TODO: fail examples
  describe('parseInputs', () => {
    const fixtures = FIXTURES.inputs
    const isAddressOwned = FIXTURES.isAddressOwned
    const network = FIXTURES.NETWORK
    describe('correctly parses inputs', () => {
      fixtures.pass.forEach(fixture => {
        it(`tx: ${fixture.txHash}`, () => {
          const { input, output } = fixture
          const result = tx.parseInputs(
            input,
            isAddressOwned,
            network)
          output.should.deep.equal(result)
        })
      })
    })
  })

  // TODO: fail examples
  describe('parseOutputs', () => {
    const fixtures = FIXTURES.outputs
    const isAddressOwned = FIXTURES.isAddressOwned
    const network = FIXTURES.NETWORK
    describe('correctly parses outputs', () => {
      fixtures.pass.forEach(fixture => {
        it(`tx: ${fixture.txHash}`, () => {
          const { input, output } = fixture
          const result = tx.parseOutputs(
            input,
            isAddressOwned,
            network)
          output.should.deep.equal(result)
        })
      })
    })
  })

  describe('parseTransactionIO', () => {}) // TODO
  describe('parseTransaction', () => {}) // TODO
  describe('retrieveTransactionData', async () => {}) // TODO
})
