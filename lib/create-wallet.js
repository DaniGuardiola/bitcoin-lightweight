const Mnemonic = require('bitcore-mnemonic')

module.exports = {
  faircoin_electrum_BIP39: (options = {}) => {
    const data = {}
    data.secret = new Mnemonic(Mnemonic.Words.SPANISH).toString()
    if (options.passphrase) data.passphrase = options.passphrase
    return data
  }
}
