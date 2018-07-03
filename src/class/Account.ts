import * as addr from '../lib/address'

import * as bitcoin from 'bitcoinjs-lib'

// ----------------
// interfaces

export interface IAccount {
  external: addr.IAddress[]
  change: addr.IAddress[]
}

export class Account implements IAccount {
  private _externalHDNode: bitcoin.HDNode
  private _changeHDNode: bitcoin.HDNode
  public external: addr.IAddress[]
  public change: addr.IAddress[]

  constructor (accountHDNode: bitcoin.HDNode) {
    // init account HD nodes
    this._externalHDNode = accountHDNode.derive(0)
    this._changeHDNode = accountHDNode.derive(1)

    // init external and change props
    this.external = []
    this.change = []
  }
}
