export interface IJsonMessageParser {
    run: (chunk: string) => void;
}
export declare class JsonMessageParser implements IJsonMessageParser {
    private _chunkBuffer;
    private _callback;
    constructor(messageCallback: (obj: Object) => void);
    run(chunk: string): void;
}
