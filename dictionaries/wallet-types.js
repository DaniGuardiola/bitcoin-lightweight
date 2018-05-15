const Joi = require('../lib/joi')

const walletTypes = {}

// bitcoin electrum BIP39 (mnemonic word-list string for Hierarchical Deterministic Keys generation)

const BIP39_SEED_SCHEMA = Joi.string().bitcoreMnemonic()

walletTypes.bitcoin_electrum_BIP39 = {
  currency: 'BTC',
  secretType: 'BIP39',

  // secret can be in two formats:
  // - string: '<mnemonic seed>'
  // - object: { seed: '<mnemonic seed>', passphrase: '<hd key passphrase>' (optional) }

  secretSchema: Joi.alternatives().try( // TODO: validate mnemonic?
    BIP39_SEED_SCHEMA,
    Joi.object({
      seed: BIP39_SEED_SCHEMA.required(),
      passphrase: Joi.string()
    })
  ).required()
}

// bitcoin electrum BIP32 (Hierarchical Deterministic Keys)

walletTypes.bitcoin_electrum_BIP32 = {
  currency: 'BTC',
  secretType: 'BIP32',
  secretSchema: Joi.string().HDPrivateKey().required() // TODO, TODO: validate HD key?
}

module.exports = walletTypes
