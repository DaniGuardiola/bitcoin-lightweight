const Wallet = require('./main')

const recoveryPhrase = 'final portion lend shoulder law salon dose pool aerobic fire mountain wide defy chimney cash'

const run = async () => {
  const wallet = new Wallet('bitcoin_electrum_BIP39', recoveryPhrase, { network: 'testnet' })

  await wallet._ensureInitialized()

  console.log(wallet._addresses.external)
  console.log(wallet._addresses.change)
  console.log(wallet._addresses.external.length)

  const {type, index} = wallet._getAddressLocationFromId('mq7CETgVeRkrh7GtSvMZVWbbo3ANBnk9mM')
  console.log(wallet._addresses[type][index])
}

run().catch(console.error)
