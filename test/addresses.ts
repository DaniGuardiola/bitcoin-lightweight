import * as chai from 'chai'
chai.use(require('chai-as-promised'))

import * as addresses from '../src/lib/addresses'

import * as FIXTURES from './fixtures/addresses'

chai.should()

const shorten = (str, length) =>
  `${str.substr(0, length)}${str.length <= length ? '' : '...'}`

describe('addresses', () => {
  describe('hdNodeToBIP49Address', () => {
    const fixtures = FIXTURES.hdNodeToBIP49Address
    const network = FIXTURES.NETWORK
    fixtures.pass.forEach(fixture => {
      it(shorten(fixture.xpriv, 35), () => {
        const { input, output } = fixture
        const result = addresses.hdNodeToBIP49Address(input, network)
        output.should.equal(result)
      })
    })
  })

  describe('publicKeyToBIP49Address', () => {
    const fixtures = FIXTURES.publicKeyToBIP49Address
    const network = FIXTURES.NETWORK
    fixtures.pass.forEach(fixture => {
      it(shorten(fixture.pub, 35), () => {
        const { input, output } = fixture
        const result = addresses.publicKeyToBIP49Address(input, network)
        output.should.equal(result)
      })
    })
  })

  describe('addressToElectrumP2shID', () => {
    const fixtures = FIXTURES.addressToElectrumP2shID
    const network = FIXTURES.NETWORK
    fixtures.pass.forEach(fixture => {
      it(fixture.input, () => {
        const { input, output } = fixture
        const result = addresses.addressToElectrumP2shID(input, network)
        output.should.equal(result)
      })
    })

    describe('fail', () => {
      fixtures.fail.forEach(fixture => {
        it(shorten(fixture.toString(), 35), () => {
          (() => addresses.addressToElectrumP2shID(fixture, network)).should.throw()
        })
      })
    })
  })
})
