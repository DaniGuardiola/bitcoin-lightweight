const Wallet = require('.').default

const seed = 'attend ordinary entire myth leg utility flat jacket trade smart despair clerk'

const run = async () => {
  const wallet = new Wallet('BITCOIN_ELECTRUM_BIP39', { seed }, { network: 'testnet' })

  /*
  const amount = Wallet.convert(4321, 'sat')

  console.log(Wallet.convert(1, 'bitcoins').toFactor(8888))
  console.log(Wallet.convert(1234, 'sat').to('btc'))
  console.log(Wallet.convert(1, 'deca').toFactor(8888))
  console.log(Wallet.convert(8888, 'mBTC').to('bits'))
  console.log(Wallet.convert(1234, 'sat').to('mbtc'))
  console.log(Wallet.convert(1234, 'sat').to('MBTC'))
  console.log(amount.to('MBTC'))
  console.log(amount.to('mBTC'))
  console.log(amount.to('msat'))
  console.log(amount.to('deca'))
  console.log(amount.to('dabtc'))
  console.log(Wallet.convert(8, 'msat').to('MBTC'))
  console.log(Wallet.convert(5, 'bitcoins').toFactor(1e-4))
  console.log(Wallet.convert(1, 'btc').to('euro'))
  console.log(Wallet.convert(0.01, 'btc').to('euro'))
  console.log(Wallet.convert(1000, 'sat').to('euro'))
  console.log(Wallet.convert(1, 'sat').to('euro'))
  */

  await wallet.ready()

  // console.log(wallet.getTransactions())
  // console.log(wallet.getTransactions().map(x => x.height))

  // console.log(wallet._bip32Wallet.mainAccount._external.map(x => `${x.id}, history: ${!!x.history.length}`))
  // console.log(wallet.getReceiveAddress())

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
