import * as chai from 'chai'
chai.use(require('chai-as-promised'))

import * as tx from '../src/lib/transactions'

import * as FIXTURES from './fixtures/transactions'

chai.should()

const shorten = (str, length) =>
  `${str.substr(0, length)}${str.length <= length ? '' : '...'}`

describe('transactions', () => {
  describe('parseTransactionHex', () => {
    const fixtures = FIXTURES.hexToTransaction
    fixtures.pass.forEach(fixture => {
      it(shorten(fixture.input.toString(), 35), () => {
        const { input, output } = fixture
        const result = tx.parseTransactionHex(input)
        output.should.deep.equal(result)
      })
    })
  })

  // TODO: fail examples & more pass examples
  describe('parseInputs', () => {
    const fixtures = FIXTURES.inputs
    const isAddressOwned = FIXTURES.isAddressOwned
    const network = FIXTURES.NETWORK
    fixtures.pass.forEach(fixture => {
      it(shorten(fixture.txHash, 35), () => {
        const { input, output } = fixture
        const result = tx.parseInputs(
          input,
          isAddressOwned,
          network)
        output.should.deep.equal(result)
      })
    })
  })

  // TODO: fail examples & more pass examples
  describe('parseOutputs', () => {
    const fixtures = FIXTURES.outputs
    const isAddressOwned = FIXTURES.isAddressOwned
    const network = FIXTURES.NETWORK
    fixtures.pass.forEach(fixture => {
      it(shorten(fixture.txHash, 35), () => {
        const { input, output } = fixture
        const result = tx.parseOutputs(
          input,
          isAddressOwned,
          network)
        output.should.deep.equal(result)
      })
    })
  })

  describe('parseTransactionIO', () => {
    const fixtures = FIXTURES.parseTransactionIO
    fixtures.pass.forEach(fixture => {
      it(shorten(fixture.hash, 35), () => {
        const { input: { inputData, outputData }, output } = fixture
        const result = tx.parseTransactionIO(inputData, outputData)
        output.should.deep.equal(result)
      })
    })
  }) // TODO
  describe('parseTransaction', () => {}) // TODO
  describe('retrieveTransactionData', async () => {}) // TODO
})
