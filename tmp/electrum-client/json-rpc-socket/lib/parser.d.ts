export declare enum PARSE_STATUS {
    DONE = 0,
    SUSPEND = 1,
    ABEND = 2
}
export interface IParseContext {
    code: PARSE_STATUS;
    chunk: string;
}
export declare type chunkHandler = (data: string, depth: number) => boolean;
export declare type parser = (chunk: string, callback: chunkHandler) => IParseContext;
export declare const createRecursiveParser: (delimiter: string, maxDepth?: number) => parser;
