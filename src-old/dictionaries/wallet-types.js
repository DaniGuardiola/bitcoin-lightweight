const Joi = require('../lib/joi')

const walletTypes = {}

// Bitcoin

const BTC = {
  currency: 'BTC',
  BIP49CoinTypes: {
    bitcoin: 0,
    testnet: 1
  }
}

// bitcoin electrum BIP39 (mnemonic word-list string for Hierarchical Deterministic Keys generation)

const BIP39_SEED_SCHEMA = Joi.string().bip39()

walletTypes.bitcoin_electrum_BIP39_BIP49 = Object.assign({}, BTC, {
  secretType: 'BIP39_BIP49',

  // secret can be in two formats:
  // - string: '<bip39 seed>'
  // - object: { seed: '<bip39 seed>', passphrase: '<hd key passphrase>' (optional) }

  secretSchema: Joi.alternatives().try( // TODO: validate bip39?
    BIP39_SEED_SCHEMA,
    Joi.object({
      seed: BIP39_SEED_SCHEMA.required(),
      passphrase: Joi.string()
    })
  ).required()
})

// bitcoin electrum BIP32 (Hierarchical Deterministic Keys) - BIP44 format

walletTypes.bitcoin_electrum_BIP49 = Object.assign({}, BTC, {
  secretType: 'BIP49',
  secretSchema: Joi.string().hdPrivateKey().required()
})

/* Note:
Faircoin BIP44 coin types:
- Livenet: 3247
- Testnet: 3248
*/

module.exports = walletTypes
