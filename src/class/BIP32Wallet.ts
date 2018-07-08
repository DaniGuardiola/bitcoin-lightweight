import Account from './Account'

import * as bitcoin from 'bitcoinjs-lib'
import ElectrumClient from '../../tmp/dist/main'
import { EventEmitter } from 'events'

export default class BIP32Wallet extends EventEmitter {
  private _rootHDNode: bitcoin.HDNode
  private _network: bitcoin.Network
  public mainAccount: Account

  constructor (seed: Buffer, network: bitcoin.Network, bip32CoinId: number, electrumClient?: ElectrumClient) {
    super()
    this._network = network
    this._rootHDNode = bitcoin.HDNode.fromSeedBuffer(seed, this._network)

    // init main account
    const mainAccountHDNode = this._rootHDNode.derivePath(`m/49'/${bip32CoinId}'/0'`)
    this.mainAccount = new Account(
      mainAccountHDNode,
      electrumClient,
      { network: this._network })
  }

  public async initialize () {
    return this.mainAccount.initialize()
  }

  public getTransactions () {
    return this.mainAccount.getTransactions()
  }
}
