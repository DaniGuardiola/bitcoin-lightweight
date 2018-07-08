import {
  IRawTransaction, ITransaction,
  parseTransactionHex,
  parseTransaction,
  retrieveTransactionData,
  TIsAddressOwned
 } from '../lib/transactions'

import * as bitcoin from 'bitcoinjs-lib'

// ----------------
// interfaces and types

interface IStoredRawTransaction extends IRawTransaction {
  hash: string
}

type TRetrieveTransactionHex = (hash: string) => Promise<string>

/**
 * Stores a history of transactions and keeps up to date through events.
 * Important: remember to bind the event handlers.
 *
 * @param network Network in which the transactions are created
 */
export default class TransactionStorage {
  private _network: bitcoin.Network
  private _rawTransactions: IStoredRawTransaction[]
  private _transactions: ITransaction[]
  private _retrieveTransactionHex: TRetrieveTransactionHex
  private _isAddressOwned: TIsAddressOwned

  constructor (
    network: bitcoin.Network,
    retrieveTransactionHex: TRetrieveTransactionHex,
    isAddressOwned: TIsAddressOwned) {

    /* Example of usage:

    new TransactionStorage(bitcoin.networks.bitcoin, hash => exampleAsyncRetrieveTxHex(hash))

    exampleEventEmitter.on('example-transaction-event',
      exampleData => handler(transactioHash, transactionHeight))

    */

    this._network = network
    this._rawTransactions = []
    this._transactions = []
    this._retrieveTransactionHex = retrieveTransactionHex
    this._isAddressOwned = isAddressOwned
  }

  // ----------------
  // storage

  private _getRawTransaction (hash: string): any {
    return this._rawTransactions.find((t: IStoredRawTransaction) => t.hash === hash)
  }

  private _putRawTransaction (storedRawTransaction: IStoredRawTransaction): void {
    this._rawTransactions.push(storedRawTransaction)
  }

  private _getTransaction (hash: string): any {
    return this._transactions.find((t: ITransaction) => t.hash === hash)
  }

  private _putTransaction (transaction: ITransaction): void {
    this._transactions.push(transaction)
  }

  // ----------------
  // retrieve with electrum

  private async _retrieveRawTransaction (hash: string): Promise<IRawTransaction> {
    // - check storage
    const stored = this._getRawTransaction(hash)
    if (stored) {
      const storedCopy = stored
      delete storedCopy.hash
      return storedCopy
    }

    // - retrieve
    const hex = await this._retrieveTransactionHex(hash) // get from electrumx server
    const rawTransaction = parseTransactionHex(hex) // parse
    this._putRawTransaction(Object.assign({}, rawTransaction, { hash })) // write in cache
    return rawTransaction
  }

  public async retrieveTransaction (hash: string, height: number): Promise<ITransaction> {
    // - check cache
    const cached = this._getTransaction(hash)
    // TODO: handle height change (-1 / unconfirmed parents > 0 / confirmed parents in mempool > n / confirmed)
    if (cached) return Object.assign({}, cached)

    // - retrieve

    // 1. get raw transaction
    const rawTransaction = await this._retrieveRawTransaction(hash)

    // 2. retrieve and collect transaction data (including the outputs referenced in the inputs)
    const transactionData = await retrieveTransactionData(hash, height, rawTransaction,
      hash => this._retrieveRawTransaction(hash), this._network)

    // 3. parse the transaction and save in cache
    const parsedTransaction = parseTransaction(transactionData,
      this._isAddressOwned) // TODO: implement isAddressOwned()
    this._putTransaction(Object.assign({}, parsedTransaction)) // write in cache

    return parsedTransaction
  }

  public getTransactions () {
    // sort transactions (older first)
    this._transactions = this._transactions
      .sort((a, b) => a.height > b.height ? 1 : -1)
    // return a copy
    return this._transactions.slice()
  }
}
