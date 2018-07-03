import { Account, IAccount } from './Account'

import * as bitcoin from 'bitcoinjs-lib'

export class AddressBook {
  private _rootHDNode: bitcoin.HDNode
  public mainAccount: IAccount

  constructor (seed: Buffer, network: bitcoin.Network, bip32CoinId: number) {
    this._rootHDNode = bitcoin.HDNode.fromSeedBuffer(seed, network)
    this.mainAccount = new Account(this._rootHDNode.derivePath(`m/49'/${bip32CoinId}'/0'`))
  }
}
