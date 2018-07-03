import { Joi } from '../lib/joi'

interface ICoin {
  currency: string
  BIP32CoinIDs: {
    bitcoin: number
    testnet: number
  }
}

export interface IWalletType extends ICoin {
  secretType: string
  secretSchema: any
}

// Bitcoin

const BTC: ICoin = {
  currency: 'BTC',
  BIP32CoinIDs: {
    bitcoin: 0,
    testnet: 1
  }
}

const BIP39_SEED_SCHEMA = Joi.string().bip39()

const BITCOIN_ELECTRUM_BIP39: IWalletType = Object.assign({}, BTC, {
  secretType: 'BIP39',

  // secret can be in two formats:
  // - string: '<bip39 seed>'
  // - object: { seed: '<bip39 seed>', passphrase: '<hd key passphrase>' (optional) }

  secretSchema: Joi.object({
    seed: BIP39_SEED_SCHEMA.required(),
    passphrase: Joi.string()
  }).required()
})

const BITCOIN_ELECTRUM_BIP32: IWalletType = Object.assign({}, BTC, {
  secretType: 'BIP49',
  secretSchema: Joi.object({
    seed: Joi.string().hdPrivateKey().required()
  })
})

// bitcoin electrum BIP39 (mnemonic word-list string for Hierarchical Deterministic Keys generation)

export const WALLET_TYPES = {
  BITCOIN_ELECTRUM_BIP39,
  BITCOIN_ELECTRUM_BIP32
}
