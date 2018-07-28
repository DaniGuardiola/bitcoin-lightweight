import * as $ from '../data/settings'

import { IAddressTransaction, addressToElectrumP2shID, hdNodeToBIP49Address } from '../lib/addresses'

import * as bitcoin from 'bitcoinjs-lib'

export interface IAddress {
  type: string
  id: string
  subscribed: boolean
  status: string | null
  history: IAddressTransaction[]
  balance: number
  electrumID: string
}

export default class Address implements IAddress {
  public type: string
  public id: string
  public subscribed: boolean
  public status: string | null
  public history: IAddressTransaction[]
  public balance: number
  public electrumID: string

  constructor (hdNode: bitcoin.HDNode, network: bitcoin.Network = $.DEFAULT_NETWORK, type: string = 'unknown') {
    this.type = type
    this.id = hdNodeToBIP49Address(hdNode, network)
    this.subscribed = false
    this.status = null
    this.history = []
    this.balance = 0
    this.electrumID = addressToElectrumP2shID(this.id, network)
  }
}
