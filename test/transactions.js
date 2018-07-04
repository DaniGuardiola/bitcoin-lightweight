/* eslint-env mocha */
const chai = require('chai')
chai.use(require('chai-as-promised'))

const tx = require('../dist/lib/transactions')

const FIXTURES = require('./fixtures/transactions')

chai.should()

const shorten = (string, length) =>
  `${string.substr(0, length)}${string.length <= length ? '' : '...'}`

describe('transactions', () => {
  describe('parseTransactionHex', () => {
    const fixtures = FIXTURES.parseTransactionHex
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

  describe('parseInputs', () => {}) // TODO
  describe('parseOutputs', () => {}) // TODO
  describe('parseTransactionIO', () => {}) // TODO
  describe('parseTransaction', () => {}) // TODO
  describe('retrieveTransactionData', async () => {}) // TODO
})
