const Wallet = require('.').default

const seed = 'attend ordinary entire myth leg utility flat jacket trade smart despair clerk'

const run = async () => {
  const wallet = new Wallet('BITCOIN_ELECTRUM_BIP39', { seed }, { network: 'testnet' })

  await wallet.ready()

  console.log(wallet.getTransactions())
  console.log(wallet.getTransactions().map(x => x.height))

  // console.log(wallet._bip32Wallet)
  // console.log(wallet)

  /*
  const prettyLog = x => console.log(`Direction: ${x.direction}, amount: ${x.amount}${
    x.feePaidByWallet ? `, fee: ${x.fee}` : ''}, total: ${x.total}`)

  wallet.alerts.on('transaction', prettyLog)
  wallet.alerts.on('balance', console.log)
  wallet.alerts.on('ready', () => console.log('ready!!!!!!!!!'))

  await wallet.onReady()

  console.log(await wallet.getBalance())
  console.log(await wallet.getBalance({ unit: 'satoshis' }))

  /*
  const {type, index} = wallet._getAddressLocationFromId('mq7CETgVeRkrh7GtSvMZVWbbo3ANBnk9mM')
  console.log(wallet._addresses[type][index])
  console.log(wallet._addresses.external.map(x => x.id))
  console.log(wallet._transactions['2b12eaac53c3ea9be3349ac57e89c31e4f20656afb0a2972b09bf8a2229b7a56'])
  */
}

run().catch(console.error)
