const Mnemonic = require('bitcore-mnemonic')
const { HDPrivateKey } = require('bitcore-lib')

module.exports = {
  bitcoin_electrum_BIP39: (options = {}) => {
    const data = {}
    data.secret = new Mnemonic(Mnemonic.Words.SPANISH).toString()
    if (options.passphrase) data.passphrase = options.passphrase
    return data
  },
  bitcoin_electrum_BIP32: (options = {}) => {
    const data = {}
    data.secret = new HDPrivateKey().toString()
    return data
  }
}
