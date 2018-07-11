"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
const lineParser = parser_1.createRecursiveParser('\n', 20);
class JsonMessageParser {
    constructor(messageCallback) {
        this._chunkBuffer = '';
        this._callback = (data, depth) => {
            try {
                messageCallback(JSON.parse(data));
            }
            catch (e) {
                return false;
            }
            return true;
        };
    }
    run(chunk) {
        let chunkBuffer = this._chunkBuffer + chunk;
        while (true) {
            const result = lineParser(chunkBuffer, this._callback);
            if (result.code === parser_1.PARSE_STATUS.DONE) {
                this._chunkBuffer = result.chunk;
                break;
            }
            else if (result.code === parser_1.PARSE_STATUS.ABEND) {
                throw new Error('JSON error: ' + result.chunk);
            }
            chunkBuffer = result.chunk;
        }
    }
}
exports.JsonMessageParser = JsonMessageParser;
