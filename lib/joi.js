const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')

module.exports = require('joi')
  // add bitcore mnemonic validation
  .extend(Joi => ({
    base: Joi.string(),
    name: 'string',
    language: {
      bip39: 'needs to be a valid bip39 string',
      hdPrivateKey: 'needs to be a valid HD private key string'
    },
    rules: [{
      name: 'bip39',
      validate (params, value, state, options) {
        if (!bip39.validateMnemonic(value)) {
          return this.createError('string.bip39', { v: value }, state, options)
        }

        return value
      }
    }, {
      name: 'hdPrivateKey',
      validate (params, value, state, options) {
        // method will throw if not valid, network shouldn't matter (defaults to bitcoin mainnet)
        if (!bitcoin.HDNode.fromBase58(value)) {
          return this.createError('string.hdPrivateKey', { v: value }, state, options)
        }

        return value
      }
    }]
  }))
