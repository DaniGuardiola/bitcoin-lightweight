const Mnemonic = require('bitcore-mnemonic')
const { HDPrivateKey } = require('bitcore-lib')

module.exports = require('joi')
  // add bitcore mnemonic validation
  .extend(Joi => ({
    base: Joi.string(),
    name: 'string',
    language: {
      bitcoreMnemonic: 'needs to be a valid bitcore-mnemonic string',
      HDPrivateKey: 'needs to be a valid HD private key string'
    },
    rules: [{
      name: 'bitcoreMnemonic',
      validate (params, value, state, options) {
        if (!Mnemonic.isValid(value)) {
          return this.createError('string.bitcoreMnemonic', { v: value }, state, options)
        }

        return value
      }
    }, {
      name: 'HDPrivateKey',
      validate (params, value, state, options) {
        if (!HDPrivateKey.isValidSerialized(value)) {
          return this.createError('string.HDPrivateKey', { v: value }, state, options)
        }

        return value
      }
    }]
  }))
