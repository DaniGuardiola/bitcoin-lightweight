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
const client_1 = require("./json-rpc-socket/client");
const protocol_1 = require("./gen/protocol");
class ElectrumClient {
    constructor(host, port, type = 'tls') {
        this._socketClient = new client_1.JSONRPCSocketClient(host, port, type);
        this.methods = new protocol_1.ElectrumProtocol(this._socketClient);
        this.events = this._socketClient.events;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._socketClient.connect();
        });
    }
}
exports.default = ElectrumClient;
