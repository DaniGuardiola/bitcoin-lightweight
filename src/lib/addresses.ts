import * as $ from '../data/settings'

import * as bitcoin from 'bitcoinjs-lib'

// ----------------
// interfaces

export interface IAddressTransaction {
  height: number
  tx_hash: string
}

// ----------------
// methods

/**
 * Gets a BIP49 P2SH(P2WPHK) address from an HD node (bitcoinjs-lib)
 * https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki
 * https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 *
 * @param hdNode HD node to be transformed (bitcoinjs-lib)
 * @param network Network to use (bitcoinjs-lib)
 */
export function hdNodeToBIP49Address (hdNode: bitcoin.HDNode, network: bitcoin.Network = $.DEFAULT_NETWORK): string {
  // derives a P2SH(P2WPKH) address from the relevant HD key for a given index
  return publicKeyToBIP49Address(hdNode.getPublicKeyBuffer(), network)
}

/**
 * Gets a BIP49 P2SH(P2WPHK) address from a public key
 * https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki
 *
 * @param publicKey Public key buffer to be transformed
 * @param network Network to use (bitcoinjs-lib)
 */
export function publicKeyToBIP49Address (publicKey: Buffer, network: bitcoin.Network = $.DEFAULT_NETWORK): string {
  // derives a P2SH(P2WPKH) address from the relevant HD key for a given index
  if (!Buffer.isBuffer(publicKey)) throw new Error('Public key must be a buffer')
  const keyhash = bitcoin.crypto.hash160(publicKey)
  const scriptSig = bitcoin.script.witnessPubKeyHash.output.encode(keyhash)
  const addressBytes = bitcoin.crypto.hash160(scriptSig)
  const outputScript = bitcoin.script.scriptHash.output.encode(addressBytes)

  const address = bitcoin.address.fromOutputScript(outputScript, network)

  // initial address object
  return address
}

/**
 * Gets a P2SH ID compatible with ElectrumX servers from a P2SH address\
 * https://electrumx.readthedocs.io/en/latest/protocol-basics.html#script-hashes
 *
 * @param address P2SH address to be transformed
 * @param network Network to use (bitcoinjs-lib)
 */
export function addressToElectrumP2shID (address: string, network: bitcoin.Network = $.DEFAULT_NETWORK): string {
  const outputScript = bitcoin.address.toOutputScript(address, network)
  const scriptHash = bitcoin.crypto.sha256(outputScript)
  return Buffer.from(scriptHash.reverse()).toString('hex')
}
