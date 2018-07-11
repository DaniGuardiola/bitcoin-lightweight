import { IJSONRPCSocketClient } from '../json-rpc-socket/client';
export interface IScripthashBalance {
    confirmed: string;
    unconfirmed: string;
}
export interface IBlockHeader {
    hex: string;
    height: number;
}
export interface ITxMerkle {
    block_height: number;
    merkle: Array<string>;
    pos: number;
}
export interface ITxInfoHistory {
    height: number;
    tx_hash: string;
}
export interface ITxInfoMempool {
    height: number;
    tx_hash: string;
    fee: number;
}
export interface ITxInfoUnspent {
    height: number;
    tx_pos: number;
    tx_hash: string;
    value: number;
}
export declare class ElectrumProtocol {
    static libname: string;
    static version: string;
    static hash: string;
    private client;
    constructor(client: IJSONRPCSocketClient);
    private _onClose;
    server_version(client_name: string, protocol_version?: [string, string]): Promise<string>;
    server_banner(): Promise<string>;
    server_donationAddress(): Promise<string>;
    server_features(): Promise<object>;
    server_peers_subscribe(): Promise<Array<Array<string>>>;
    blockchain_transaction_broadcast(rawtx: string): Promise<string>;
    blockchain_transaction_getMerkle(tx_hash: string, tx_height: number): Promise<ITxMerkle>;
    blockchain_transaction_get(tx_hash: string, verbose?: boolean): Promise<string>;
    blockchain_estimatefee(target_block: number): Promise<number>;
    blockchain_block_getHeader(height: number): Promise<object>;
    blockchain_headers_subscribe(raw?: boolean): Promise<IBlockHeader>;
    blockchain_scripthash_getBalance(scripthash: string): Promise<IScripthashBalance>;
    blockchain_scripthash_getHistory(scripthash: string): Promise<Array<ITxInfoHistory>>;
    blockchain_scripthash_getMempool(scripthash: string): Promise<Array<ITxInfoMempool>>;
    blockchain_scripthash_listunspent(scripthash: string): Promise<Array<ITxInfoUnspent>>;
    blockchain_scripthash_subscribe(scripthash: string): Promise<string>;
    server_ping(): Promise<void>;
    mempool_getFeeHistogram(): Promise<Array<[number, number]>>;
}
export declare namespace validate {
    const IScripthashBalance: (obj: object) => boolean;
    const IBlockHeader: (obj: object) => boolean;
    const ITxMerkle: (obj: object) => boolean;
    const ITxInfoHistory: (obj: object) => boolean;
    const ITxInfoMempool: (obj: object) => boolean;
    const ITxInfoUnspent: (obj: object) => boolean;
}
