import Account, { IAccount } from './Account'
import { ITransaction } from '../lib/transactions'

import ElectrumClient from '../../tmp/dist/main'
import * as bitcoin from 'bitcoinjs-lib'
import { EventEmitter } from 'events'

export default class BIP32Wallet extends EventEmitter {
  private _initialized: boolean
  private _rootHDNode: bitcoin.HDNode
  private _accountsHDNode: bitcoin.HDNode
  private _network: bitcoin.Network
  private _electrum?: ElectrumClient
  public mainAccount: IAccount

  constructor (seed: Buffer, network: bitcoin.Network, bip32CoinId: number, electrumClient?: ElectrumClient) {
    super()
    this._initialized = false
    this._electrum = electrumClient
    this._network = network

    // HD nodes
    this._rootHDNode = bitcoin.HDNode.fromSeedBuffer(seed, this._network)
    this._accountsHDNode = this._rootHDNode.derivePath(`m/49'/${bip32CoinId}'`)

    // init main account
    this.mainAccount = this._createAccount(0)
  }

  // ----------------
  // helpers

  private _createAccount (derivation: number): IAccount {
    const hdNode = this._accountsHDNode.deriveHardened(derivation)
    return new Account(
      hdNode,
      this._electrum,
      { network: this._network })
  }

  private _ensureInitialized (): void {
    if (!this._initialized) throw new Error('Account is not initialized yet!')
  }

  // ----------------
  // interface

  public async initialize (): Promise<void> {
    await this.mainAccount.initialize()
    this._initialized = true
  }

  public getTransactions (): ITransaction[] {
    this._ensureInitialized()
    return this.mainAccount.getTransactions()
  }
}
