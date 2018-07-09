import * as $ from '../settings'

import * as bitcoin from 'bitcoinjs-lib'

// ----------------
// interfaces

export interface IAddressTransaction {
  height: number
  tx_hash: string
}

export interface IAddress {
  type: string
  id: string
  subscribed: boolean
  status: string | null
  history: IAddressTransaction[]
  balance: number
}

// ----------------
// methods

export function toBIP49Address (hdNode: bitcoin.HDNode, network: bitcoin.Network = $.DEFAULT_NETWORK, type: string = 'unknown'): IAddress {
  // derives a P2SH(P2WPKH) address from the relevant HD key for a given index
  const id = getBIP49Address(hdNode.getPublicKeyBuffer(), network)

  // initial address object
  return {
    type,
    id,
    subscribed: false,
    status: null,
    history: [],
    balance: 0
  }
}

export function getBIP49Address (publicKey: Buffer, network: bitcoin.Network = $.DEFAULT_NETWORK): string {
    // derives a P2SH(P2WPKH) address from the relevant HD key for a given index
  const keyhash = bitcoin.crypto.hash160(publicKey)
  const scriptSig = bitcoin.script.witnessPubKeyHash.output.encode(keyhash)
  const addressBytes = bitcoin.crypto.hash160(scriptSig)
  const outputScript = bitcoin.script.scriptHash.output.encode(addressBytes)

  const address = bitcoin.address.fromOutputScript(outputScript, network)

    // initial address object
  return address
}

export function getElectrumP2shID (address: string, network: bitcoin.Network = $.DEFAULT_NETWORK): string {
  const outputScript = bitcoin.address.toOutputScript(address, network)
  const scriptHash = bitcoin.crypto.sha256(outputScript)
  return Buffer.from(scriptHash.reverse()).toString('hex')
}
