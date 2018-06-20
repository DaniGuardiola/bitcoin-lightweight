const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')

module.exports = {
  bitcoin_electrum_BIP39_BIP49: (options = {}) => {
    const data = {}
    data.secret = bip39.generateMnemonic()
    if (options.passphrase) data.passphrase = options.passphrase
    return data
  },
  bitcoin_electrum_BIP49: (options = {}) => {
    const network = options.network
      ? bitcoin.networks[options.network]
      : bitcoin.networks.bitcoin // TODO: Joi validate network option instead
    const data = {}
    const mnemonic = bip39.generateMnemonic()
    const seed = bip39.mnemonicToSeed(mnemonic)
    const hdNode = bitcoin.HDNode.fromSeedBuffer(seed, network)
    data.secret = hdNode.toBase58() // TODO: to base58
    return data
  }
}
