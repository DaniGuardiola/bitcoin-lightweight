# fairwallet-lib

A module that abstracts the wallet internal logic for the Fairwallet app (but feel free to use it on your own app or service).

In short, this module provides a Javascript class that supports different types of wallets in the [Faircoop](fair.coop) ecosystem. It is an abstraction of the internals of the wallet, making it easy to focus on the UX of apps instead of dealing with internal logic such as blockchain stuff, cryptography, communication with servers, transaction management, retrieving information and more.

# Types of wallets

At the moment, only two types of wallet are supported and they are both Faircoin and Electrum based.

## Faircoin (electrum)

[Faircoin](fair-coin.org) is a Bitcoin-based cryptocurrency that is intended as an eco-friendly coin (thanks to [Proof of Cooperation](github.com/faircoin/faircoin/blob/master/doc/on-proof-of-cooperation.md)) for a fair economy.

At the moment, only [Electrum](electrum.org) ([faircoin fork](github.com/faircoin/electrumfair)) wallets are supported.

As it is based on Bitcoin, the logic is pretty much the same, allowing the use of adapted Bitcoin libraries that already exist. The libraries currently used in `fairwallet-lib` are forks of [`bitcore-lib`](github.com/bitpay/bitcore-lib) ([fork](github.com/faircoin/faircore-lib)) and [`electrum-client`](`github.com/you21979/node-electrum-client/`) (fork in progress).

### BIP-39 (mnemonics)

-   [BIP-0039 spec](github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)

Wallet that is generated from a "seed" phrase comformed of multiple words separated by spaces, making it friendlier for humans and easier to remember than a standard private key.

ID: `fairwallet_electrum_bip39`

### BIP-32 (Hierarchical Deterministic Wallets)

-   [BIP-0032 spec](github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)

Wallet that generates the same keypairs (addresses) from the same "parent" private key through a complex deterministic mathematical algorithm.

ID: `fairwallet_electrum_bip32`

# API reference

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [main](#main)
    -   [onReady](#onready)
    -   [getAddresses](#getaddresses)
    -   [getBalance](#getbalance)
    -   [create](#create)

## main

Abstracts the logic of wallets, supporting multiple types for multiple currencies.

**Parameters**

-   `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Type of wallet
-   `secret` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object))** Private information that provides full access to the wallet

### onReady

Resolves once wallet is up-to-date and ready to be used (or immediately if that's already the current state)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves only once ready

### getAddresses

Returns **{external: [array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;{id: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), balance: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)}>, change: [array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;{id: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), balance: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)}>}** Addresses and their current balances

### getBalance

Retrieves the current wallet balance and the estimation for the secondary currency

**Parameters**

-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Options for the getBalance operation (optional, default `{}`)
    -   `options.secondaryCurrency` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Overwrites the secondary currency setting
    -   `options.withSymbol` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Returns strings with the currency symbol appended instead of just numbers for balances

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;{balance: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number), secondary: {balance: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number), currency: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)}}>** Object that contains the balance of the wallet currency and the secondary currency information

### create

Creates a new wallet

**Parameters**

-   `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Wallet type
-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Options for wallet creation (optional, default `{}`)

Returns **Wallet** Wallet instance
