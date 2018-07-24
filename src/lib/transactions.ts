import * as bitcoin from 'bitcoinjs-lib'

// ----------------
// types

export type TIsAddressOwned = (address: string) => boolean

// ----------------
// interfaces

/** BitcoinJS input (In) that includes 'originalOutput' being spent */
interface IExtendedIn extends bitcoin.In {
  originalOutput: bitcoin.Out
  txHash: string
}

/** All data that needs to be retrieved to parse a transaction */
interface ITransactionData {
  hash: string
  height: number
  ins: IExtendedIn[]
  outs: bitcoin.Out[]
  network: bitcoin.Network
}

/** Input transaction data related to a wallet */
interface IInputData {
  inputExternalAddresses: string[]
  inputBalance: number
  inputOwnedBalance: number
  allInputOwned: boolean
  ins: ITransactionIODetailsInput[]
}

/** Output transaction data related to a wallet */
interface IOutputData {
  outputExternalAddresses: string[]
  outputBalance: number
  outputOwnedBalance: number
  outs: ITransactionIODetailsOutput[]
}

interface ITransactionIODetailsInput {
  amount: number
  script: string
  scriptSig: string
  scriptType: string
  transaction: string
  outputIndex: number
  sequence: number
}

interface ITransactionIODetailsOutput {
  amount: number
  script: string
  scriptType: string
}

interface ITransactionIODetails {
  in: ITransactionIODetailsInput[]
  out: ITransactionIODetailsOutput[]
}

/** Transaction data computed from the input and output and wallet information */
interface ITransactionIO extends ITransactionIODetails {
  direction: 'in' | 'out'
  peers: string[]
  total: number
  amount: number
  fee: number
  feePaidByWallet: boolean
}

/** Complete transaction data */
export interface ITransaction extends ITransactionIO {
  hash: string
  height: number
}

/** Hex of a transaction and its bitcoinjs instance */
export interface IRawTransaction {
  hex: string
  // TODO: height
  transaction: bitcoin.Transaction
}

// ----------------
// helpers

function uniqStringArray (array: string[]): string[] {
  let seen = {}
  let out: string[] = []
  let len = array.length
  let j = 0
  for (let i = 0; i < len; i++) {
    let item = array[i]
    if (seen[item] !== 1) {
      seen[item] = 1
      out[j++] = item
    }
  }
  return out
}

// ----------------
// parse input / output data

/**
 * Parses the inputs of a transation to return wallet-aware data
 *
 * @param inputs Transaction inputs
 * @param isAddressOwned Methods that checks if an address is owned by a wallet
 * @param network Network of the transaction
 */
export function parseInputs (inputs: IExtendedIn[], isAddressOwned: TIsAddressOwned, network: bitcoin.Network): IInputData {
  const inputExternalAddresses: string[] = []
  let inputBalance = 0
  let inputOwnedBalance = 0
  const ins: ITransactionIODetailsInput[] = []

  inputs.forEach(input => {
    const address = bitcoin.address.fromOutputScript(input.originalOutput.script, network)
    if (isAddressOwned(address)) inputOwnedBalance += input.originalOutput.value
    else inputExternalAddresses.push(address)
    inputBalance += input.originalOutput.value

    ins.push({
      amount: input.originalOutput.value,
      script: bitcoin.script.toASM(input.originalOutput.script),
      scriptSig: bitcoin.script.toASM(input.script),
      scriptType: bitcoin.script.classifyOutput(input.originalOutput.script),
      transaction: input.txHash,
      outputIndex: input.index,
      sequence: input.sequence
    })
  })

  const allInputOwned = inputBalance === inputOwnedBalance

  return {
    inputExternalAddresses,
    inputBalance,
    inputOwnedBalance,
    allInputOwned,
    ins
  }
}

/**
 * Parses the outputs of a transation to return wallet-aware data
 *
 * @param outputs Transaction outputs
 * @param isAddressOwned Method that checks if an address is owned by a wallet
 * @param network Network of the transaction
 */
export function parseOutputs (outputs: bitcoin.Out[], isAddressOwned: TIsAddressOwned, network: bitcoin.Network): IOutputData {
  const outputExternalAddresses: string[] = []
  let outputBalance = 0
  let outputOwnedBalance = 0
  const outs: ITransactionIODetailsOutput[] = []

  outputs.forEach(output => {
    const address = bitcoin.address.fromOutputScript(output.script, network)
    if (isAddressOwned(address)) outputOwnedBalance += output.value
    else outputExternalAddresses.push(address)
    outputBalance += output.value

    outs.push({
      amount: output.value,
      script: bitcoin.script.toASM(output.script),
      scriptType: bitcoin.script.classifyOutput(output.script)
    })
  })

  return {
    outputExternalAddresses,
    outputBalance,
    outputOwnedBalance,
    outs
  }
}

/**
 * Parses a transaction's input and output wallet-aware data
 *
 * @param inputData Input data related to a wallet
 * @param outputData Output data related to a wallet
 */
export function parseTransactionIO (inputData: IInputData, outputData: IOutputData): ITransactionIO {
  const {
    inputExternalAddresses,
    inputBalance,
    inputOwnedBalance,
    allInputOwned,
    ins
  } = inputData

  const {
    outputExternalAddresses,
    outputBalance,
    outputOwnedBalance,
    outs
  } = outputData

  const change = outputOwnedBalance - inputOwnedBalance

  const direction = change > 0 ? 'in' : 'out'

  const fee = inputBalance - outputBalance // TODO: detect if fee was paid by this wallet
  let feePaidByWallet = false

  const total = change
  let amount = Math.abs(total)

  let peers: string[] = []

  if (direction === 'in') {
    if (inputOwnedBalance === 0) {
      peers = inputExternalAddresses
    } else peers = ['Not supported']
    // throw new Error(`Type of transaction not covered yet (owned inputs on incoming transaction)\nTX: ${hash}`)
  } else { // out
    if (allInputOwned) {
      peers = outputExternalAddresses
      feePaidByWallet = true
      amount -= fee
    } else peers = ['Not supported']
    // throw new Error(`Type of transaction not covered yet (external inputs on outgoing transaction)\nTX: ${hash}`)
  }

  peers = uniqStringArray(peers)

  return {
    direction,
    peers,
    total,
    amount,
    fee,
    feePaidByWallet,
    in: ins,
    out: outs
  }
}

// ----------------
// parse transaction data

/**
 * Parses a transaction serialized in hexadecimal format
 *
 * @param hex Serialized transaction
 */
export const parseTransactionHex = (hex: string): IRawTransaction => ({
  hex,
  transaction: bitcoin.Transaction.fromHex(hex)
})

/**
 * Parses transaction data and returns wallet-aware data
 *
 * @param transactionData Transaction full data
 * @param isAddressOwned Methods that checks if an address is owned by a wallet
 */
export function parseTransaction (transactionData: ITransactionData, isAddressOwned: TIsAddressOwned): ITransaction {
  const { hash, height, network, ins, outs } = transactionData

  const inputData = parseInputs(ins,
    isAddressOwned,
    network)

  const outputData = parseOutputs(outs,
    isAddressOwned,
    network)

  const parsedIO = parseTransactionIO(inputData, outputData)

  return Object.assign({ hash, height }, parsedIO)
}

// ----------------
// retrieve

/**
 * Retrieves all the data necessary to parse a transaction
 *
 * @param hash Transaction hash
 * @param height Block height in which the transaction is included
 * @param rawTransaction Raw transaction data
 * @param retrieveRawTransaction Method that retrieves a raw transaction
 * @param network Network of the transaction
 */
export async function retrieveTransactionData (hash: string, height: number, rawTransaction: IRawTransaction,
  retrieveRawTransaction: (hash: string) => Promise<IRawTransaction>,
  network: bitcoin.Network): Promise<ITransactionData> {

  const { transaction: { ins: originalIns, outs } } = rawTransaction

  const ins = await Promise.map(originalIns, async (input: bitcoin.In): Promise<IExtendedIn> => {
    const txHash = input.hash.toString('hex')
    const inputScriptCopy = Buffer.alloc(input.hash.length)
    input.hash.copy(inputScriptCopy)
    const hash = Buffer.from(inputScriptCopy.reverse()).toString('hex')
    const { transaction: originalTx } = await retrieveRawTransaction(hash)
    return Object.assign({}, input, { originalOutput: originalTx.outs[input.index], txHash })
  })

  return {
    hash,
    height,
    ins,
    outs,
    network
  }
}
