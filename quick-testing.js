const Wallet = require('./main')

const recoveryPhrase = 'final portion lend shoulder law salon dose pool aerobic fire mountain wide defy chimney cash'

const run = async () => {
  const wallet = new Wallet('bitcoin_electrum_BIP39', recoveryPhrase, { network: 'testnet' })

  await wallet.onReady()

  console.log(wallet._addresses.external)
  console.log(wallet._addresses.change)
  console.log(wallet._addresses.external.length)

  const {type, index} = wallet._getAddressLocationFromId('mq7CETgVeRkrh7GtSvMZVWbbo3ANBnk9mM')
  console.log(wallet._addresses[type][index])
  console.log(wallet._transactions['2b12eaac53c3ea9be3349ac57e89c31e4f20656afb0a2972b09bf8a2229b7a56'].transaction.toJSON())
}

run().catch(console.error)
