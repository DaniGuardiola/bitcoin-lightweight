/* eslint-env mocha */
const chai = require('chai')
chai.use(require('chai-as-promised'))

const tx = require('../dist/lib/transactions')

const txFixtures = require('./fixtures/transactions')

chai.should()

describe('transactions', () => {
  describe('parseTransactionHex', () => {
    const fixtures = txFixtures.parseTransactionHex
    describe('correctly parses hex-serialized transactions', () => {
      fixtures.pass.forEach(fixture => {
        it(fixture.input, () => {
          const { input, output } = fixture
          const result = tx.parseTransactionHex(input)
          output.should.deep.equal(result)
        })
      })
    })

    describe('fails to parse malformed hex-serialized transactions', () => {
      fixtures.fail.forEach(fixture => {
        it(fixture.toString(), () => {
          (() => tx.parseTransactionHex(fixture)).should.throw()
        })
      })
    })
  })

  describe('parseInputs', () => {}) // TODO
  describe('parseOutputs', () => {}) // TODO
  describe('parseTransactionIO', () => {}) // TODO
  describe('parseTransaction', () => {}) // TODO
  describe('retrieveTransactionData', () => {}) // TODO
})
