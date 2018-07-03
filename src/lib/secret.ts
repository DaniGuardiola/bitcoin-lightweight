import * as bip39 from 'bip39'
import { Network } from 'bitcoinjs-lib'

export interface IBIP39Secret {
  seed: string
  passphrase: string | undefined
}

export interface IBIP32Secret {
  seed: Buffer
}

export function _parseBIP39Secret (secret: IBIP39Secret): Buffer {
  // github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
  const originalSeed = secret.seed
  const passphrase = secret.passphrase

  // derive and return HD seed from mnemonic
  return bip39.mnemonicToSeed(originalSeed, passphrase)
}

/* TODO: BIP32
export function _parseBIP32Secret (secret: IBIP32Secret, network: Network): Buffer {
  // github.com/bitcoin/bips/blob/master/bip-0032.mediawiki

  // TODO: return HD private key
  // this._rootHDNode = bitcoin.HDNode.fromBase58(this._secret, this._network)
}
*/
