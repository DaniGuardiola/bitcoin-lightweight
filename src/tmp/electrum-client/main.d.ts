/// <reference types="node" />
import { ElectrumProtocol } from './gen/protocol';
import { EventEmitter } from 'events';
export default class ElectrumClient {
    private _socketClient;
    methods: ElectrumProtocol;
    events: EventEmitter;
    constructor(host: string, port: number, type?: string);
    connect(): Promise<void>;
}
