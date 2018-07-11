/// <reference types="node" />
import { EventEmitter } from 'events';
/** Socket client instance */
export interface IJSONRPCSocketClient {
    _onEnd: (e: Error) => void;
    _onError: (e: Error) => void;
    _onRecv: (chunk: string) => void;
    _onConnect: () => void;
    _onClose: (e: Error) => void;
    request: (method: string, params: Array<any>) => Promise<any>;
    events: EventEmitter;
}
export declare class JSONRPCSocketClient implements IJSONRPCSocketClient {
    private _sequence;
    private _host;
    private _port;
    private _callbackMessageTable;
    private _connection;
    private _jsonMessageParser;
    private _status;
    events: EventEmitter;
    constructor(host: string, port: number, protocol?: string, options?: any);
    private _getJsonMessageParser;
    connect(): Promise<void>;
    close(): void;
    private _responseHandler;
    request<T1, T2>(method: string, params: T1): Promise<T2>;
    private _onMessageResponse;
    private _onMessageNotification;
    private _onMessageBatchResponse;
    _onConnect(): void;
    _onClose(): void;
    _onRecv(chunk: string): void;
    _onEnd(e: Error): void;
    _onError(e: Error): void;
}
