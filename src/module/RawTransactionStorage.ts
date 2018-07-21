import { IRawTransaction } from '../lib/transactions'

// ----------------
// interfaces and types

interface IStoredRawTransaction extends IRawTransaction {
  hash: string
}

export default class RawTransactionStorage {
  private _rawTransactions: IStoredRawTransaction[]

  constructor () {
    this._rawTransactions = []
  }

  public _getRawTransaction (hash: string): IRawTransaction | null {
    const storedRawTransaction = this._rawTransactions.find((t: IStoredRawTransaction) => t.hash === hash)
    if (!storedRawTransaction) return null
    const rawTransaction = Object.assign({}, storedRawTransaction)
    delete rawTransaction.hash
    return rawTransaction
  }

  public _putRawTransaction (rawTransaction: IRawTransaction, hash: string): void {
    if (this._getRawTransaction(hash)) throw new Error(`Raw transaction already exists in storage! ${hash}`)
    const storedRawTransaction: IStoredRawTransaction = Object.assign({}, rawTransaction, { hash })
    this._rawTransactions.push(storedRawTransaction)
  }
}
