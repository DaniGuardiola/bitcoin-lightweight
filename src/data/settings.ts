import * as bitcoin from 'bitcoinjs-lib'

export const DEFAULT_NETWORK = bitcoin.networks.bitcoin
export const DEFAULT_GAP_LIMIT = 20
export const CHANGE_GAP_LIMIT = 6
export const ADDRESSES_UPDATE_CONCURRENCY = 20
export const TRANSACTION_RETRIEVAL_CONCURRENCY = 10
