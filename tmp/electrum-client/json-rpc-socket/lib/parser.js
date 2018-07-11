"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
var PARSE_STATUS;
(function (PARSE_STATUS) {
    PARSE_STATUS[PARSE_STATUS["DONE"] = 0] = "DONE";
    PARSE_STATUS[PARSE_STATUS["SUSPEND"] = 1] = "SUSPEND";
    PARSE_STATUS[PARSE_STATUS["ABEND"] = 2] = "ABEND";
})(PARSE_STATUS = exports.PARSE_STATUS || (exports.PARSE_STATUS = {}));
const recursiveParser = (depth, chunk, callback, options) => {
    if (chunk.length === 0)
        return { code: PARSE_STATUS.DONE, chunk: chunk }; // if chunk is empty - done
    if (depth >= options.maxDepth)
        return { code: PARSE_STATUS.SUSPEND, chunk: chunk }; // if depth is equal or higher than max depth - suspend
    const chunks = chunk.split(options.delimiter); // split chunk by delimiter
    if (chunks.length === 1)
        return { code: PARSE_STATUS.DONE, chunk: chunk }; // if chunk list only contains one item - done
    assert(chunks.length !== 0); // ensure that the chunk list contains items
    const currentChunk = chunks[0]; // get current chunk
    const remainingChunks = chunks.slice(1).join(options.delimiter); // obtain remaining chunks
    const result = callback(currentChunk, depth); // run callback and store the result
    if (!result)
        return { code: PARSE_STATUS.ABEND, chunk }; // if the result is falsy - abend
    return recursiveParser(depth + 1, remainingChunks, callback, options); // recursive call
};
exports.createRecursiveParser = (delimiter, maxDepth = 10) => {
    assert(maxDepth > 0);
    return (chunk, callback) => recursiveParser(0, chunk, callback, { delimiter, maxDepth });
};
