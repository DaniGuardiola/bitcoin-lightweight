"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("./lib/socket");
const json_message_parser_1 = require("./lib/json-message-parser");
const events_1 = require("events");
const jsonrpc_spec_1 = require("jsonrpc-spec");
// ----------------
// helpers
const createPromiseResult = (resolve, reject) => {
    return (err, result) => {
        if (err)
            reject(err);
        else
            resolve(result);
    };
};
// ----------------
// client
// TODO: document JSON-RPC stuff
class JSONRPCSocketClient {
    constructor(host, port, protocol = 'tcp', options = void 0) {
        this._sequence = 0;
        this._host = host;
        this._port = port;
        this._callbackMessageTable = {};
        this._jsonMessageParser = this._getJsonMessageParser();
        this._status = 0;
        this.events = new events_1.EventEmitter();
        this._connection = socket_1.initSocketClient(this, protocol, options);
    }
    // ----------------
    // JSON message parser
    _getJsonMessageParser() {
        return new json_message_parser_1.JsonMessageParser((obj) => {
            const type = jsonrpc_spec_1.util2.autoDetect(obj);
            switch (type) {
                case jsonrpc_spec_1.type2.JSON_TYPE.BATCH:
                    this._onMessageBatchResponse(obj);
                    break;
                case jsonrpc_spec_1.type2.JSON_TYPE.RESPONSE:
                    this._onMessageResponse(jsonrpc_spec_1.type2.JSON_TYPE.RESPONSE, obj);
                    break;
                case jsonrpc_spec_1.type2.JSON_TYPE.RESPONSE_ERROR:
                    this._onMessageResponse(jsonrpc_spec_1.type2.JSON_TYPE.RESPONSE_ERROR, obj);
                    break;
                case jsonrpc_spec_1.type2.JSON_TYPE.NOTIFICATION:
                    this._onMessageNotification(obj);
                    break;
                default:
                    break;
            }
        });
    }
    // ----------------
    // lifecycle methods
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._status)
                return Promise.resolve();
            this._status = 1;
            return socket_1.asyncSocketConnect(this._connection, this._host, this._port);
        });
    }
    close() {
        if (!this._status) {
            return;
        }
        this._connection.end();
        this._connection.destroy();
        this._status = 0;
    }
    // ----------------
    // request and response
    _responseHandler(type, obj) {
        if (obj.id === null) {
            return;
        }
        const cb = this._callbackMessageTable[obj.id];
        if (cb) {
            delete this._callbackMessageTable[obj.id];
            switch (type) {
                case jsonrpc_spec_1.type2.JSON_TYPE.RESPONSE:
                    const r = jsonrpc_spec_1.util2.resolveResponse(obj);
                    cb(null, r.result);
                    break;
                case jsonrpc_spec_1.type2.JSON_TYPE.RESPONSE_ERROR:
                    const re = jsonrpc_spec_1.util2.resolveResponseError(obj);
                    cb(new Error(re.error.code + ': ' + re.error.message));
                    break;
            }
        }
        else {
            // TODO: handle unexpected messages
        }
    }
    request(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._status)
                return Promise.reject(new Error('ESOCKET'));
            return new Promise((resolve, reject) => {
                const id = ++this._sequence;
                const req = jsonrpc_spec_1.util2.makeRequest(id, method, params);
                const content = [JSON.stringify(req), '\n'].join('');
                this._callbackMessageTable[id] = createPromiseResult(resolve, reject);
                this._connection.write(content);
            });
        });
    }
    // ----------------
    // message events
    _onMessageResponse(type, obj) {
        this._responseHandler(type, obj);
    }
    _onMessageNotification(obj) {
        const message = jsonrpc_spec_1.util2.resolveNotification(obj);
        this.events.emit(message.method, message.params);
    }
    _onMessageBatchResponse(obj) {
        // TODO: support batch responses
    }
    // ----------------
    // socket event handlers
    _onConnect() {
        // TODO
        // get version and check compatibility?
    }
    _onClose() {
        Object.keys(this._callbackMessageTable).forEach((key) => {
            const cb = this._callbackMessageTable[key];
            cb(new Error('close connect'));
            delete this._callbackMessageTable[key];
        });
    }
    _onRecv(chunk) {
        try {
            this._jsonMessageParser.run(chunk);
        }
        catch (e) {
            this._connection.on('error', e);
        }
    }
    _onEnd(e) {
        // TODO
    }
    _onError(e) {
        this.close();
    }
}
exports.JSONRPCSocketClient = JSONRPCSocketClient;
