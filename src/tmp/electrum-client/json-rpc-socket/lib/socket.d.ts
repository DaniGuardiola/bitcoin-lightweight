/// <reference types="node" />
import { Socket } from 'net';
import { IJSONRPCSocketClient } from '../client';
export declare class TimeoutError implements Error {
    message: string;
    errno: string;
    code: string;
    name: string;
    connect: boolean;
    constructor(message: string);
    toString(): string;
}
/**
 * Initialize a socket client
 *
 * @param client Socket client instance
 * @param protocol Socket protocol (tcp or tls)
 * @param options Socket client options
 */
export declare const initSocketClient: (client: IJSONRPCSocketClient, protocol: string, options: any) => Socket;
/**
 * Connects a Socket instance and resolves when the connection is sucessful
 *
 * @param connection Socket connection
 * @param host ElectrumX server IP or URL
 * @param port ElectrumX server port
 */
export declare const asyncSocketConnect: (connection: Socket, host: string, port: number) => Promise<void>;
