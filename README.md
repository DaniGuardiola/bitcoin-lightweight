# bitcoin-lightweight

A friendly lightweight Bitcoin wallet written in typescript

# Features

-   BIP49 key derivation, with external and change addresses
-   BIP39 seed (mnemonic phrase) generation or import with optional passphrase
-   Real time events:
    -   New incoming or outgoing transactions for all addresses
    -   Transaction status change on the blockchain (unconfirmed / inputs confirmed / confirmed)
    -   New blocks
-   Automatic SPV
-   Automatic transaction composition, signing and broadcasting
-   Storage-friendly: a normalized way to save and restore the state of the JavaScript class to load your app or service fast
-   Really easy to use and high level API, so you can focus on building your own great user interface or API

# Tech stack

- [Typescript](https://www.typescriptlang.org/) codebase (more security, faster development, less bugs!)
- [BitcoinJS](https://github.com/bitcoinjs/bitcoinjs-lib/) module for blockchain logic (heavily tested and powerful library)
- [Joi](https://github.com/hapijs/joi) validation of input (keep those bugs away!)
- [ElectrumX](https://electrumx.readthedocs.io/en/latest/) servers as backend (socket and websocket connections with TLS supported)
- [electrum-client](https://github.com/DaniGuardiola/node-electrum-client) module to communicate with electrumx servers (written in typescript, maintained by us)

# Usage

```js
import { Wallet } from 'bitcoin-lightweight'

const app = async () {
  const wallet = new Wallet(                    // create a Wallet instance
    'BITCOIN_ELECTRUM_BIP39',                   // wallet type
    'chair window sun guitar piano sky brick',  // secret
    { network: 'testnet' })                     // options

  await wallet.ready()                          // wait for 100% load (all data downloaded, parsed and processed)

  const bitcoinBalance = wallet.getBalance()    // obtain wallet balance in bitcoin
  console.log()

  const euroBalance = wallet.getBalance()       // obtain balance in euro
  const txs = wallet.getTransactions()          // obtain transactions
  await wallet.send(10, '3b2re3n4vvbbnfndm4b3m1s')    // send some bitcoin
  wallet.receive()                              // get last unused address
}

app()
```

> Note: the concept of a "wallet" can be also used to describe a collection of addresses and their private keys, instead of the wallet software itself.

Two types of Bitcoin electrum wallets are supported:

### Types of wallet

-   BIP39 (mnemonic)

> [BIP-0039 spec](github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)

Generated from a "seed" phrase comformed of multiple words separated by spaces, making it friendly and easier to remember than a standard private key. Generates a BIP32 HD key (read below).

ID: `BITCOIN_ELECTRUM_BIP39_BIP49`

-   BIP-32 (Hierarchical Deterministic key)

> [BIP-0032 spec](github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)

Generated from a private HD key. A Hierarchical Deterministic (HD) key is a seed that can be derived into multiple sub-keys or addresses. BIP39 phrases are converted to BIP32 seeds.

Currently, the only derivation path is BIP49 with addresses only from default account at index 0. Addresses are P2SH(P2WPKH) or Pay To Witness (segwit) Public Key Hash wrapped in Pay To Script Hash.

> [BIP-0049 spec](github.com/bitcoin/bips/blob/master/bip-004.mediawiki)

ID: `BITCOIN_ELECTRUM_BIP49`