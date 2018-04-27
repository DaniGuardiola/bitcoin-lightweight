const Mnemonic = require('bitcore-mnemonic')

module.exports = require('joi')
  // add bitcore mnemonic validation
  .extend(Joi => ({
    base: Joi.string(),
    name: 'string',
    language: {
      bitcoreMnemonic: 'needs to be a valid bitcore-mnemonic string'
    },
    rules: [{
      name: 'bitcoreMnemonic',
      validate (params, value, state, options) {
        if (!Mnemonic.isValid(value)) {
          return this.createError('string.bitcoreMnemonic', { v: value }, state, options)
        }

        return value
      }
    }]
  }))
