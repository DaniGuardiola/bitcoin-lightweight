"use strict";
/* tslint:disable variable-name */
Object.defineProperty(exports, "__esModule", { value: true });
// ----------------
// electrum protocol
class ElectrumProtocol {
    constructor(client) {
        this.client = client;
        this.client.events.on('close', () => { this._onClose(); });
    }
    // ----------------
    // lifecycle handlers
    _onClose() {
        const list = [];
        list.push('blockchain.headers.subscribe');
        list.push('blockchain.scripthash.subscribe');
        list.forEach(event => this.client.events.removeAllListeners(event));
    }
    // ----------------
    // electrum methods
    // Identify the client to the server and negotiate the protocol version.
    server_version(client_name, protocol_version = ['1.2', '1.4']) {
        return this.client.request('server.version', [client_name, protocol_version]);
    }
    // Return a banner to be shown in the Electrum console.
    server_banner() {
        return this.client.request('server.banner', []);
    }
    // Return a server donation address.
    server_donationAddress() {
        return this.client.request('server.donation_address', []);
    }
    // Return a list of features and services supported by the server.
    server_features() {
        return this.client.request('server.features', []);
    }
    // Return a list of peer servers. Despite the name this is not a subscription and the server must send no notifications.
    server_peers_subscribe() {
        return this.client.request('server.peers.subscribe', []);
    }
    // Broadcast a transaction to the network.
    blockchain_transaction_broadcast(rawtx) {
        return this.client.request('blockchain.transaction.broadcast', [rawtx]);
    }
    // Return the merkle branch to a confirmed transaction given its hash and height.
    blockchain_transaction_getMerkle(tx_hash, tx_height) {
        return this.client.request('blockchain.transaction.get_merkle', [tx_hash, tx_height]);
    }
    // Return a raw transaction.
    blockchain_transaction_get(tx_hash, verbose = false) {
        return this.client.request('blockchain.transaction.get', [tx_hash, verbose]);
    }
    // Return the estimated transaction fee per kilobyte for a transaction to be confirmed within a certain number of blocks.
    blockchain_estimatefee(target_block) {
        return this.client.request('blockchain.estimatefee', [target_block]);
    }
    // Return the deserialized header of the block at the given height.
    blockchain_block_getHeader(height) {
        return this.client.request('blockchain.block.get_header', [height]);
    }
    // Subscribe to receive block headers when a new block is found.
    blockchain_headers_subscribe(raw = true) {
        return this.client.request('blockchain.headers.subscribe', [raw]);
    }
    // Return the confirmed and unconfirmed balances of a script hash.
    blockchain_scripthash_getBalance(scripthash) {
        return this.client.request('blockchain.scripthash.get_balance', [scripthash]);
    }
    // Return the confirmed and unconfirmed history of a script hash.
    blockchain_scripthash_getHistory(scripthash) {
        return this.client.request('blockchain.scripthash.get_history', [scripthash]);
    }
    // Return the unconfirmed transactions of a script hash.
    blockchain_scripthash_getMempool(scripthash) {
        return this.client.request('blockchain.scripthash.get_mempool', [scripthash]);
    }
    // A list of unspent outputs in blockchain order. This function takes the mempool into account.
    blockchain_scripthash_listunspent(scripthash) {
        return this.client.request('blockchain.scripthash.listunspent', [scripthash]);
    }
    // Subscribe to a script hash.
    blockchain_scripthash_subscribe(scripthash) {
        return this.client.request('blockchain.scripthash.subscribe', [scripthash]);
    }
    // server_ping
    server_ping() {
        return this.client.request('server.ping', []);
    }
    // Return a histogram of the fee rates paid by transactions in the memory pool, weighted by transaction size. [fee, vsize] pairs
    mempool_getFeeHistogram() {
        return this.client.request('mempool.get_fee_histogram', []);
    }
}
ElectrumProtocol.libname = 'javascript client';
ElectrumProtocol.version = '1.2';
ElectrumProtocol.hash = '9abd00e899a8eb82382c7651d2ac94882e6b8349ee9c8352569bf22fe853caf0';
exports.ElectrumProtocol = ElectrumProtocol;
// ----------------
// electrum methods
var validate;
(function (validate) {
    validate.IScripthashBalance = (obj) => {
        // TODO: const props = [ &#39;confirmed&#39;, &#39;unconfirmed&#39; ]
        return [
            'confirmed',
            'unconfirmed'
        ].every(prop => prop in obj);
    };
    validate.IBlockHeader = (obj) => {
        // TODO: const props = [ &#39;hex&#39;, &#39;height&#39; ]
        return [
            'hex',
            'height'
        ].every(prop => prop in obj);
    };
    validate.ITxMerkle = (obj) => {
        // TODO: const props = [ &#39;block_height&#39;, &#39;merkle&#39;, &#39;pos&#39; ]
        return [
            'block_height',
            'merkle',
            'pos'
        ].every(prop => prop in obj);
    };
    validate.ITxInfoHistory = (obj) => {
        // TODO: const props = [ &#39;height&#39;, &#39;tx_hash&#39; ]
        return [
            'height',
            'tx_hash'
        ].every(prop => prop in obj);
    };
    validate.ITxInfoMempool = (obj) => {
        // TODO: const props = [ &#39;height&#39;, &#39;tx_hash&#39;, &#39;fee&#39; ]
        return [
            'height',
            'tx_hash',
            'fee'
        ].every(prop => prop in obj);
    };
    validate.ITxInfoUnspent = (obj) => {
        // TODO: const props = [ &#39;height&#39;, &#39;tx_pos&#39;, &#39;tx_hash&#39;, &#39;value&#39; ]
        return [
            'height',
            'tx_pos',
            'tx_hash',
            'value'
        ].every(prop => prop in obj);
    };
})(validate = exports.validate || (exports.validate = {}));
