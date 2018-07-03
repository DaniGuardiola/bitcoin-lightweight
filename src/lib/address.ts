import * as bitcoin from 'bitcoinjs-lib'

// ----------------
// interfaces

interface IAddressTx {
  hex: string
  tx_height: number
}

export interface IAddress {
  type: string
  id: string
  scriptHash: Buffer
  subscribed: boolean
  status: string | null
  history: IAddressTx[]
  balance: number
}

// ----------------
// methods

export function deriveBIP49Address (hdNode: bitcoin.HDNode, type: string, network: bitcoin.Network): IAddress {
  // derives a P2SH(P2WPKH) address from the relevant HD key for a given index
  const keyhash = bitcoin.crypto.hash160(hdNode.getPublicKeyBuffer())
  const scriptSig = bitcoin.script.witnessPubKeyHash.output.encode(keyhash)
  const addressBytes = bitcoin.crypto.hash160(scriptSig)
  const outputScript = bitcoin.script.scriptHash.output.encode(addressBytes)

  const id = bitcoin.address.fromOutputScript(outputScript, network)
  const scriptHash = bitcoin.crypto.sha256(outputScript)

  // initial address object
  return {
    type,
    id,
    scriptHash,
    subscribed: false,
    status: null,
    history: [],
    balance: 0
  }
}
