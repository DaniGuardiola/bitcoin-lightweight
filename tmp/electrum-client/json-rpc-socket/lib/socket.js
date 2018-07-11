"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const tls_1 = require("tls");
// ----------------
// constants
const TIMEOUT = 10000;
// ----------------
// helpers
class TimeoutError {
    constructor(message) {
        this.message = message;
        this.errno = 'ETIMEDOUT';
        this.code = 'ETIMEDOUT';
        this.name = 'TimeoutError';
        this.connect = false;
    }
    toString() {
        return `${this.name}: ${this.message}`;
    }
}
exports.TimeoutError = TimeoutError;
// ----------------
// socket methods
const getSocket = (protocol, options) => {
    switch (protocol) {
        case 'tcp':
            return new net_1.Socket(); // TODO: no options?
        case 'tls':
        case 'ssl':
            return new tls_1.TLSSocket(options);
        default:
            throw new Error('unknown protocol');
    }
};
/**
 * Initialize a socket client
 *
 * @param client Socket client instance
 * @param protocol Socket protocol (tcp or tls)
 * @param options Socket client options
 */
exports.initSocketClient = (client, protocol, options) => {
    const conn = getSocket(protocol, options); // create connection
    // set options
    conn.setTimeout(TIMEOUT);
    conn.setEncoding('utf8');
    conn.setKeepAlive(true, 0);
    conn.setNoDelay(true);
    // event handlers
    conn.on('connect', () => {
        conn.setTimeout(0);
        client._onConnect();
    });
    conn.on('close', (e) => client._onClose(e));
    conn.on('timeout', () => conn.emit('error', new TimeoutError('Connection timed out')));
    conn.on('data', (chunk) => {
        conn.setTimeout(0);
        client._onRecv(chunk);
    });
    conn.on('end', (e) => {
        conn.setTimeout(0);
        client._onEnd(e);
    });
    conn.on('error', (e) => client._onError(e));
    // return socket connection
    return conn;
};
/**
 * Connects a Socket instance and resolves when the connection is sucessful
 *
 * @param connection Socket connection
 * @param host ElectrumX server IP or URL
 * @param port ElectrumX server port
 */
exports.asyncSocketConnect = (connection, host, port) => {
    return new Promise((resolve, reject) => {
        const errorHandler = (e) => reject(e);
        connection.connect(port, host, () => {
            connection.removeListener('error', errorHandler);
            resolve();
        });
        connection.on('error', errorHandler);
    });
};
