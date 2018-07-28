const bitcoin = require('bitcoinjs-lib')

// TODO: group transactions

// ----------------
// constants and utils

const NETWORK = bitcoin.networks.testnet

// all addresses have been generated in testnet with this bip39 phrase:
// attend ordinary entire myth leg utility flat jacket trade smart despair clerk
const WALLET_ADDRESSES = [
  '2N89cVE71RAK2fzW63D57JE6k2gEWGvqBMu',
  '2NGZN8n6UCnkhtxgQFioGKUnyVaz8Gayq1v',
  '2MttDtha7JVzrGFmTYp6mEdN225eo93Km8k',
  '2MtkNgYLvNVeoqoYVtQAK2Y6xanp18665qk',
  '2MthSNc9U32DLDRkFvsD2ipf5hkg7MTCb5n',
  '2N9SYrxivcmKBBd8ZSFo5rJnnajKVc571DY',
  '2N3dPqaNYUdYGESU8auWtUeXZW8ECCrk7MW',
  '2NGR3QqMo6s3Wxu9DZoZa5hmjQVYfvbZrTo',
  '2NDvu28iQqGNppWFYv8RDefvu8pUHgXDduT',
  '2N9Q89v2zSjFEwfVnzKkXMpancGRvvDCHCh',
  '2Mzd2NPUjvMoBPxSUH36dJLjpaiQircXwL9',
  '2MwGroMzghKSEfQwLw1wtLk93cjgo1AfxUp',
  '2NEZrMWn7yeZLTd4U8d6tu1k7HrNonAHACq',
  '2N7zjNciRGYJttPHbGwTP3sNjEVhYVsBgoG',
  '2N5vNep5vFdfhmXeLrJWcwf24WcEYMpokkS',
  '2MyhSzcUe6eT4TWT1rDrGpbNTSh6AzfZHJR',
  '2ND2s63qXcSWxUj2fNYBP3mBpqMa755Dsdb',
  '2NBQ5KBcip24pBCxKgMkVDwFRebRfUMbyv9',
  '2N7GU2GuZQy4Tsd6qMx2nQZzzbuC6mqB2Ff',
  '2MtzmoJEkiSunWDhtnuvfABByrsfG6sZmat',
  '2NC1uTtaS9meErLtvWU88Sd75fjTSz7jT9v',
  '2NCKss1m87hVBQS1P2ma9DL3dcUdkfQ165H',
  '2N3wJMJTLGzWM48LEfcorBS3qiNmY6bApv3',
  '2Mw2c9kFGHWKo45G6YoktEXhGzkRrWo7ujg',
  '2Mw1cVwrH6Aafj1DJAcuSyS6avHTMyX6RgT',
  '2N1PrFUtxp9yfTMWtdrVG9qv5Mjrj8DjMsK',
  '2N4EBmXyVvfomh17JMmDgwSqHPX5DzMuzKq',
  '2N9rxCjD84Ey4fsoXH1x8ghaPpXz5ejF6j8',
  '2MwnphPtfZpuoEuFafkgbzM5anzoba8janJ']

const isAddressOwned = address => WALLET_ADDRESSES.indexOf(address) > -1

// ----------------
// fixtures

// TODO:
// - with witness
// - multiple inputs and outputs
const hexToTransaction = {
  pass: [
    '01000000026a4d14176d458eaea1b40ff61aefd364adee2d350f4d758986a2036e22d13f26000000006a47304402203d7731135754a1976e339836b3d18643d0ee9f4390955c417c4102fb62699831022012b6a0ed084cd92666a782d0ad6b749c9d0a156bd290940a3ec6da769191c6c8012103eff23e1d33b5925ae391aa5681cf382276cf285bff671b6a2422662452a17525ffffffff3877d444e4a1c0cd76f6763bdef957148f51877a674b3904cb15c2a996e767c6010000006b483045022100f7f0cfabd67c5176c2825c4392305c4d33b3f05888d1773abff2fd09f6c4e3bd022005a5f217c9f19e82db35187c9b69535c3f34c8199ab35c3ea1d85d9d9339bc54012102d3f5cca3905df6b599b51d0c8c1d16d970b1d813d477b1cb60f0339b3bc3f92cffffffff020090d0030000000017a914422c4ed9aa15a98e5d303c2d23ad0991cf5619218710070e00000000001976a914357b3e68dfd0183067ce0e9a171a4ff0417e195088ac00000000',
    '0100000002d41c20d8441460407f51f8b03a12020c74271e0b3d0a878e1f6e4e3b90836a03010000006a473044022019a79fb80d090bbd928327a8ed8cc4b73969d200a4bd4e88f0401fb8a7891ca80220685d2a779c6e6bb26cb2ed19b5c7b4fd4533e285429918e2fe5b928dc803788b012103c3f882b2e4ad058a94ab45c6cca91ea8181be67f6804b2d77fdc06353848f948feffffff59a0eaca6a1afa4903703070a4c85924dbb778989df54d94cdf0e50daaf0a0c1010000006b483045022100965549441a58338398732d46a1570edc863a46726299bc1123088d983af2f7400220624746fd3cc5e3c1e937e2134542b67400e6d179be80a2754004522cb04728b80121028cfa5bb2c30892e823e032d8ddf52ba8e01e24c56185b94810f4ceeb507427e5feffffff01dfdff902000000001976a914e9c96c7c5199f42c9cbf560cea548f26e32305e588aca53b1400',
    '010000000176ba450911d316e7de37f38dc845f859cc9f2abb4cf7126a4973782814ffeb88010000006b483045022100d803fa814ab3ec45547ff3836e719ae440398d6410e3f25eca7874dc0eb1e60202203f6c81137d9c5cfb0c65b7035968e7345e5bbfdf18b7e797891bbcf5339fcbe00121035a54b578c04f546f99518ac4f5ed5fc869539703e507ce0eaf0cb54c30b4936cffffffff0280f0fa02000000001976a9141e25d797573cc8ecce7866ea58c8feabda25d7f888acb7b8e400000000001976a9149b82ac00188b25b59c2dcefac0a051ee6fd9abe988ac00000000',
    '010000000001014ad6f9a83869a0682903395ff2f41e8af90a2925afb08cb958f73a9efb32457100000000171600142414c823c029d9211b2556b83ffe7ac8b79fcef0feffffff02002d3101000000001976a91418dcb145984f0ef5d8d453abe5d9b96f4c402e5988acd4619f020000000017a9142a3b8fe18d8e2a7646c64f0748623b1c76fb9cda8702483045022100eba490f5cd6dfdd0eb7311d5917a75e9f98392199088ec032a8b79c813841a1102202491bde39db2314569885db2eb72a2319c8a9ab0ea59fa0095e0f213aed94385012102485d6216d33452a70fd31ab87a02322d496a2c72ea8f8c1bf05101d1c3941602a93b1400',
    '010000000222e7f9fd6232b1aff2911a69e4bb32598112848cdfe5b5f89731a2a9314b5e2a000000006a47304402200f7dadf8a909d3f566a23194704fd491c640779549067e987407e7a1cb37f7e702201cab6f3f6c29b4ca99ddde1a4375c33187d690581371ad986b2969fca6b90d04012103b6ef8fcdfccf7ed38b0a25024cb8ea6f709501dfdf59c122987fcd3ca4f0c917ffffffff559d7823119deb20a04f1943f34341785ad659d8854f4d2903fd9962de210b11000000006a47304402200b258c668294831ad1388a8965741ba2dbd1ac891cd381909534c13a35a02eae02203c47b5597c7b8bbc04b93aa0743624ebabf1a7b7290fbdaeb5610989872772ff012102dc99f5b0b80096ba29377dcfd8b10dca9fdd1a4c55fcea2a5d1d5b62dfdf14a5ffffffff02c0d8a7000000000017a914b0794b73708756327d969bd3182350a6e05abd278725d61900000000001976a9142260d7e02f1b0d759526b6e5c11482a38c24a3bc88ac00000000'
  ].map(hex => ({
    input: hex,
    output: {
      hex: hex,
      transaction: bitcoin.Transaction.fromHex(hex)
    }
  })),
  fail: [
    '01000000026a4d14176d458eaea1b40ff61aefd364adee2d350f4d758986a2036e22d13f26000000006a47304402203d7731135754a1976e339836b3d18643d0ee9f4390955c417c4102fb62699831022012b6a0ed084cd92666a782d0ad6b749c9d0a156bd290940a3ec6da769191c6c8012103eff23e1d33b5925ae391aa5681cf382276cf285bff671b6a2422662452a17525ffffffff3877d444e4a1c0cd76f6763bdef957148f51877a674b3904cb15c2a996e767c6010000006b483045022100f7f0cfabd67c5176c2825c4392305c4d33b3f05888d1773abff2fd09f6c4e3bd022005a5f217c9f19e82db35187c9b69535c3f34c8199ab35c3ea1d85d9d9339bc54012102d3f5cca3905df6b599b51d0c8c1d16d970b1d813d477b1cb60f0339b3bc3f92cffffffff020090d0000017a914422c4ed9aa15a98e5d303c2d23ad0991cf5619218710070e00000000001976a914357b3e68dfd0183067ce0e9a171a4ff0417e195088ac00000000',
    'wrong hex',
    '010000000176ba450911d316e7de37f38dc845f859cc9f2abb4cf7126a4973782814ffeb88010000006b483045022100d803fa814ab3ec45547ff3836e719ae440398d6410e3f25eca7874dc0eb1e60202203f6c81137d9c5cfb0c65b7035968e7345e5bbfdf18b7e797891bbcf5339fcbe00121035a54b578c04f546f99518ac4f5ed5fc869539703e507ce0eaf0cb54c30b4936cffffffff0280f0fa0200000000197a9141e25d797573cc8ecce7866ea58c8feabda25d7f888acb7b8e400000000001976a9149b82ac00188b25b59c2dcefac0a051ee6fd9abe988ac00000000',
    '0100000002d41c20d8441460407f51f8b03a12020c74271e0b3da878e1f6e4e3b90836a03010000006a47304422019a79fb80d090bbd928327a8ed8cc4b73969d200a4bd4e88f0401fb8a7891ca80220685d2a779c6e6bb26cb2ed19b5c7b4fd4533e285429918e2fe5b928dc803788b012103c3f882b2e4ad058a94ab45c6cca91ea8181be67f6804b2d77fdc06353848f948feffffff59a0eaca6a1afa4903703070a4c85924dbb778989df54d94cdf0e50daaf0a0c1010000006b483045022100965549441a58338398732d46a1570edc863a46726299bc1123088d983af2f7400220624746fd3cc5e3c1e937e2134542b67400e6d179be80a2754004522cb04728b80121028cfa5bb2c30892e823e032d8ddf52ba8e01e24c56185b94810f4ceeb507427e5feffffff01dfdff902000000001976a914e9c96c7c5199f42c9cbf560cea548f26e32305e588aca53b1',
    2341213123,
    { a: 'test', b: { c: 'deep' } },
    ['nope', { d: 22 }]
  ]
}

// TODO:
// - fail examples
// - with witness
// - multiple inputs and outputs
// - transaction without owned addresses
const inputs = {
  pass: [{
    txHash: 'a6a65b8f577c5f9f9b7e27914fba598fa1cae89e17a37e67727d6b21346858de',

    input: [{
      hash: 'ecd081867eaa667607ab3b6dd5fc1c897517acb3b2e32fd633dece96dae6eaef',
      index: 1,
      script: '483045022100a3c73257ab0ed5adbbe530537a5db21b57756cde1c9bbb449faf382c8567a93e022069ffb5324783ed2bffdfedd008c8dac3d395f51db889457b135195db905f859b012102eab2aeea2810b546111a29007e1cc75935228f52c63dbd6ccdeaa0f3129d7c1c',
      sequence: 4294967295,
      witness: [],
      originalOutput: {
        value: 48979975,
        script: '76a914b69095f0926b50308abd042951af0eb8ff42f40588ac' },
      txHash: 'ecd081867eaa667607ab3b6dd5fc1c897517acb3b2e32fd633dece96dae6eaef'
    }],

    output: {
      inputExternalAddresses: [ 'mxAGUxWUwiwp8YBp2fdF6NP7EM46h82UM2' ],
      inputBalance: 48979975,
      inputOwnedBalance: 0,
      allInputOwned: false,
      ins: [{
        amount: 48979975,
        script: 'OP_DUP OP_HASH160 b69095f0926b50308abd042951af0eb8ff42f405 OP_EQUALVERIFY OP_CHECKSIG',
        scriptSig: '3045022100a3c73257ab0ed5adbbe530537a5db21b57756cde1c9bbb449faf382c8567a93e022069ffb5324783ed2bffdfedd008c8dac3d395f51db889457b135195db905f859b01 02eab2aeea2810b546111a29007e1cc75935228f52c63dbd6ccdeaa0f3129d7c1c',
        scriptType: 'pubkeyhash',
        transaction: 'ecd081867eaa667607ab3b6dd5fc1c897517acb3b2e32fd633dece96dae6eaef',
        outputIndex: 1,
        sequence: 4294967295
      }]
    }
  }, {
    txHash: '902e49e18796e2eff3f3948060cbe089cb2e4055c44af2baad21632bfb01dd70',

    input: [{
      hash: '60251391c1174e3843f5c4561d6860625579a69ddfb0ca1f3190255073f3e15e',
      index: 0,
      script: '483045022100cd6c55c7157dc2f3656e81561c3762651fcab5377de8864d6da755c0949bdd4202203f940ef011733d9b2dc2e18f171fc9654b3fae485d44ccc0373196d824c5542f012103ee247e8ed2e581920c82d6041aa1255cfa8d525e0fe35781a665ce27ed8afd8b',
      sequence: 4294967294,
      witness: [],
      originalOutput:
     { value: 2505750573,
       script: '76a9141237df4629b9d28803f2eaddb663111fcef54dee88ac' },
      txHash: '60251391c1174e3843f5c4561d6860625579a69ddfb0ca1f3190255073f3e15e' } ],

    output: { inputExternalAddresses: [ 'mhBHPaBqohpvX2kAyDY9JzT8CSGiayuZyS' ],
      inputBalance: 2505750573,
      inputOwnedBalance: 0,
      allInputOwned: false,
      ins:
     [ { amount: 2505750573,
       script: 'OP_DUP OP_HASH160 1237df4629b9d28803f2eaddb663111fcef54dee OP_EQUALVERIFY OP_CHECKSIG',
       scriptSig: '3045022100cd6c55c7157dc2f3656e81561c3762651fcab5377de8864d6da755c0949bdd4202203f940ef011733d9b2dc2e18f171fc9654b3fae485d44ccc0373196d824c5542f01 03ee247e8ed2e581920c82d6041aa1255cfa8d525e0fe35781a665ce27ed8afd8b',
       scriptType: 'pubkeyhash',
       transaction: '60251391c1174e3843f5c4561d6860625579a69ddfb0ca1f3190255073f3e15e',
       outputIndex: 0,
       sequence: 4294967294 } ] }
  }]
}

// convert hex strings to buffer
inputs.pass.forEach(item => item.input.map(txInput => {
  txInput.hash = Buffer.from(txInput.hash, 'hex')
  txInput.script = Buffer.from(txInput.script, 'hex')
  txInput.originalOutput.script = Buffer.from(txInput.originalOutput.script, 'hex')
}))

// TODO:
// - fail examples
// - with witness
// - multiple inputs and outputs
// - transaction without owned addresses

const outputs = {
  pass: [{
    txHash: 'a6a65b8f577c5f9f9b7e27914fba598fa1cae89e17a37e67727d6b21346858de',

    input: [{
      value: 50000,
      script: 'a91411f76f9e3ac76076a11e3da93a0e114bcf87054e87' }, {
      value: 48910535,
      script: '76a914203032dfca01bae143e011f26cdd6091822e0bcd88ac'
    }],

    output: {
      outputExternalAddresses: [ 'miT9f6gsBYd2gaGjb34X8VJBRF8n8vhyuj' ],
      outputBalance: 48960535,
      outputOwnedBalance: 50000,
      outs:
     [ { amount: 50000,
       script: 'OP_HASH160 11f76f9e3ac76076a11e3da93a0e114bcf87054e OP_EQUAL',
       scriptType: 'scripthash' },
     { amount: 48910535,
       script: 'OP_DUP OP_HASH160 203032dfca01bae143e011f26cdd6091822e0bcd OP_EQUALVERIFY OP_CHECKSIG',
       scriptType: 'pubkeyhash' }
     ]
    }
  }, {
    txHash: '902e49e18796e2eff3f3948060cbe089cb2e4055c44af2baad21632bfb01dd70',

    input: [{
      value: 83823003,
      script: 'a914a37a2c166402eeee959d5efd34b6c9ee4f8320e787' }, {
      value: 2421815570,
      script: '76a914ef464f4a0c84ef6e9617872811ae29490c62bb0f88ac'
    }],

    output: {
      outputExternalAddresses: [ 'n3L8279JgdDrrVATyRNST5z2n2RoLywgmc' ],
      outputBalance: 2505638573,
      outputOwnedBalance: 83823003,
      outs:
     [ { amount: 83823003,
       script: 'OP_HASH160 a37a2c166402eeee959d5efd34b6c9ee4f8320e7 OP_EQUAL',
       scriptType: 'scripthash' },
     { amount: 2421815570,
       script: 'OP_DUP OP_HASH160 ef464f4a0c84ef6e9617872811ae29490c62bb0f OP_EQUALVERIFY OP_CHECKSIG',
       scriptType: 'pubkeyhash' } ] }
  }]
}

// convert hex strings to buffer
outputs.pass.forEach(item => item.input.map(txInput => {
  txInput.script = Buffer.from(txInput.script, 'hex')
}))

const parseTransactionIO = {
  pass: [{
    hash: 'a6a65b8f577c5f9f9b7e27914fba598fa1cae89e17a37e67727d6b21346858de',

    input: {
      inputData: {
        inputExternalAddresses: [ 'mxAGUxWUwiwp8YBp2fdF6NP7EM46h82UM2' ],
        inputBalance: 48979975,
        inputOwnedBalance: 0,
        allInputOwned: false,
        ins: [{
          amount: 48979975,
          script: 'OP_DUP OP_HASH160 b69095f0926b50308abd042951af0eb8ff42f405 OP_EQUALVERIFY OP_CHECKSIG',
          scriptSig: '3045022100a3c73257ab0ed5adbbe530537a5db21b57756cde1c9bbb449faf382c8567a93e022069ffb5324783ed2bffdfedd008c8dac3d395f51db889457b135195db905f859b01 02eab2aeea2810b546111a29007e1cc75935228f52c63dbd6ccdeaa0f3129d7c1c',
          scriptType: 'pubkeyhash',
          transaction: 'ecd081867eaa667607ab3b6dd5fc1c897517acb3b2e32fd633dece96dae6eaef',
          outputIndex: 1,
          sequence: 4294967295
        }]
      },
      outputData: {
        outputExternalAddresses: [ 'miT9f6gsBYd2gaGjb34X8VJBRF8n8vhyuj' ],
        outputBalance: 48960535,
        outputOwnedBalance: 50000,
        outs: [{
          amount: 50000,
          script: 'OP_HASH160 11f76f9e3ac76076a11e3da93a0e114bcf87054e OP_EQUAL',
          scriptType: 'scripthash' }, {
          amount: 48910535,
          script: 'OP_DUP OP_HASH160 203032dfca01bae143e011f26cdd6091822e0bcd OP_EQUALVERIFY OP_CHECKSIG',
          scriptType: 'pubkeyhash'
        }]
      }
    },

    output: { direction: 'in',
      peers: [ 'mxAGUxWUwiwp8YBp2fdF6NP7EM46h82UM2' ],
      total: 50000,
      amount: 50000,
      fee: 19440,
      feePaidByWallet: false,
      in: [{
        amount: 48979975,
        script: 'OP_DUP OP_HASH160 b69095f0926b50308abd042951af0eb8ff42f405 OP_EQUALVERIFY OP_CHECKSIG',
        scriptSig: '3045022100a3c73257ab0ed5adbbe530537a5db21b57756cde1c9bbb449faf382c8567a93e022069ffb5324783ed2bffdfedd008c8dac3d395f51db889457b135195db905f859b01 02eab2aeea2810b546111a29007e1cc75935228f52c63dbd6ccdeaa0f3129d7c1c',
        scriptType: 'pubkeyhash',
        transaction: 'ecd081867eaa667607ab3b6dd5fc1c897517acb3b2e32fd633dece96dae6eaef',
        outputIndex: 1,
        sequence: 4294967295 } ],
      out: [{
        amount: 50000,
        script: 'OP_HASH160 11f76f9e3ac76076a11e3da93a0e114bcf87054e OP_EQUAL',
        scriptType: 'scripthash' }, {
        amount: 48910535,
        script: 'OP_DUP OP_HASH160 203032dfca01bae143e011f26cdd6091822e0bcd OP_EQUALVERIFY OP_CHECKSIG',
        scriptType: 'pubkeyhash'
      }]
    }
  }, {
    hash: '902e49e18796e2eff3f3948060cbe089cb2e4055c44af2baad21632bfb01dd70',

    input: {
      inputData: {
        inputExternalAddresses: [ 'mhBHPaBqohpvX2kAyDY9JzT8CSGiayuZyS' ],
        inputBalance: 2505750573,
        inputOwnedBalance: 0,
        allInputOwned: false,
        ins: [{
          amount: 2505750573,
          script: 'OP_DUP OP_HASH160 1237df4629b9d28803f2eaddb663111fcef54dee OP_EQUALVERIFY OP_CHECKSIG',
          scriptSig: '3045022100cd6c55c7157dc2f3656e81561c3762651fcab5377de8864d6da755c0949bdd4202203f940ef011733d9b2dc2e18f171fc9654b3fae485d44ccc0373196d824c5542f01 03ee247e8ed2e581920c82d6041aa1255cfa8d525e0fe35781a665ce27ed8afd8b',
          scriptType: 'pubkeyhash',
          transaction: '60251391c1174e3843f5c4561d6860625579a69ddfb0ca1f3190255073f3e15e',
          outputIndex: 0,
          sequence: 4294967294
        }]
      },
      outputData: {
        outputExternalAddresses: [ 'n3L8279JgdDrrVATyRNST5z2n2RoLywgmc' ],
        outputBalance: 2505638573,
        outputOwnedBalance: 83823003,
        outs: [{
          amount: 83823003,
          script: 'OP_HASH160 a37a2c166402eeee959d5efd34b6c9ee4f8320e7 OP_EQUAL',
          scriptType: 'scripthash' }, {
          amount: 2421815570,
          script: 'OP_DUP OP_HASH160 ef464f4a0c84ef6e9617872811ae29490c62bb0f OP_EQUALVERIFY OP_CHECKSIG',
          scriptType: 'pubkeyhash'
        }]
      }
    },

    output: {
      direction: 'in',
      peers: [ 'mhBHPaBqohpvX2kAyDY9JzT8CSGiayuZyS' ],
      total: 83823003,
      amount: 83823003,
      fee: 112000,
      feePaidByWallet: false,
      in: [{
        amount: 2505750573,
        script: 'OP_DUP OP_HASH160 1237df4629b9d28803f2eaddb663111fcef54dee OP_EQUALVERIFY OP_CHECKSIG',
        scriptSig: '3045022100cd6c55c7157dc2f3656e81561c3762651fcab5377de8864d6da755c0949bdd4202203f940ef011733d9b2dc2e18f171fc9654b3fae485d44ccc0373196d824c5542f01 03ee247e8ed2e581920c82d6041aa1255cfa8d525e0fe35781a665ce27ed8afd8b',
        scriptType: 'pubkeyhash',
        transaction: '60251391c1174e3843f5c4561d6860625579a69ddfb0ca1f3190255073f3e15e',
        outputIndex: 0,
        sequence: 4294967294 } ],
      out: [{
        amount: 83823003,
        script: 'OP_HASH160 a37a2c166402eeee959d5efd34b6c9ee4f8320e7 OP_EQUAL',
        scriptType: 'scripthash' }, {
        amount: 2421815570,
        script: 'OP_DUP OP_HASH160 ef464f4a0c84ef6e9617872811ae29490c62bb0f OP_EQUALVERIFY OP_CHECKSIG',
        scriptType: 'pubkeyhash'
      }]
    }
  }, {
    hash: '3412759e3f39db7866cc6760cba358deca594e727f62ea621f45182b12add54e',

    input: {
      inputData: {
        inputExternalAddresses: [
          '2N3mvjSc3Lg4vGrpk1RSWu76AGrKTV4wd3E',
          '2N87YQvLvWWnQkMxxPXjUVKJuAoAgDMRZVx' ],
        inputBalance: 50778658447,
        inputOwnedBalance: 0,
        allInputOwned: false,
        ins: [{
          amount: 62409139,
          script: 'OP_HASH160 737fbf8776622c6467d8bf2381a5910db3c3fd49 OP_EQUAL',
          scriptSig: '001462d5aa424bcb7e4487bad3fbbaf2333264d00e8f',
          scriptType: 'scripthash',
          transaction: '6302a966a86622f7c93e0623bee37a7f482562ca81d24ffed9b0f2b126c545f9',
          outputIndex: 1,
          sequence: 4294967295
        }, {
          amount: 50716249308,
          script: 'OP_HASH160 a315f074f56ed158d45e2a382ed19cf2d33dcab8 OP_EQUAL',
          scriptSig: '0014f1b8d08acfb582d0254efee283491b48bd71ea62',
          scriptType: 'scripthash',
          transaction: 'c5d5b0618a38d05c785e4a71296e24189da9194780a5b900a74732c7d4449c20',
          outputIndex: 1,
          sequence: 4294967295
        }]
      },
      outputData: {
        outputExternalAddresses: [ '2N6KWi3WREP7Zi8PSJjutvGnp2CUEgUwp7p' ],
        outputBalance: 50778558447,
        outputOwnedBalance: 65000000,
        outs: [{
          amount: 65000000,
          script: 'OP_HASH160 a37a2c166402eeee959d5efd34b6c9ee4f8320e7 OP_EQUAL',
          scriptType: 'scripthash' }, {
          amount: 50713558447,
          script: 'OP_HASH160 8f694195b6ed3c66ed2eb90efe6298355a0bb7e7 OP_EQUAL',
          scriptType: 'scripthash'
        }]
      }
    },

    output: {
      direction: 'in',
      peers: [
        '2N3mvjSc3Lg4vGrpk1RSWu76AGrKTV4wd3E',
        '2N87YQvLvWWnQkMxxPXjUVKJuAoAgDMRZVx'
      ],
      total: 65000000,
      amount: 65000000,
      fee: 100000,
      feePaidByWallet: false,
      in: [{
        amount: 62409139,
        script: 'OP_HASH160 737fbf8776622c6467d8bf2381a5910db3c3fd49 OP_EQUAL',
        scriptSig: '001462d5aa424bcb7e4487bad3fbbaf2333264d00e8f',
        scriptType: 'scripthash',
        transaction: '6302a966a86622f7c93e0623bee37a7f482562ca81d24ffed9b0f2b126c545f9',
        outputIndex: 1,
        sequence: 4294967295 }, {
        amount: 50716249308,
        script: 'OP_HASH160 a315f074f56ed158d45e2a382ed19cf2d33dcab8 OP_EQUAL',
        scriptSig: '0014f1b8d08acfb582d0254efee283491b48bd71ea62',
        scriptType: 'scripthash',
        transaction: 'c5d5b0618a38d05c785e4a71296e24189da9194780a5b900a74732c7d4449c20',
        outputIndex: 1,
        sequence: 4294967295
      }],
      out: [{
        amount: 65000000,
        script: 'OP_HASH160 a37a2c166402eeee959d5efd34b6c9ee4f8320e7 OP_EQUAL',
        scriptType: 'scripthash' }, {
        amount: 50713558447,
        script: 'OP_HASH160 8f694195b6ed3c66ed2eb90efe6298355a0bb7e7 OP_EQUAL',
        scriptType: 'scripthash'
      }]
    }
  }, {
    hash: '5354d0e028c7b452e720be042d4aa7ba04fa1092de84df8b926a0b21cfe3b031',

    input: {
      inputData: {
        inputExternalAddresses: [ '2N6PBMNjBR5n6rgGn81ZwxDzsZDp5gAqpR5' ],
        inputBalance: 115095056,
        inputOwnedBalance: 0,
        allInputOwned: false,
        ins: [{
          amount: 115095056,
          script: 'OP_HASH160 901ac31d4f62bb99522dbbf93cc067f04e861df8 OP_EQUAL',
          scriptSig: '00144425acb0273444e389d764221d484859cb6bbae1',
          scriptType: 'scripthash',
          transaction: 'f3ebef153460929874f4185cf6a51035f8b657e7478fd4bb1711b907037b5ba6',
          outputIndex: 0,
          sequence: 4294967294
        }]
      },
      outputData: {
        outputExternalAddresses: [ '2MtYYAJBxm8GYe4R8GdWcHmVebna571ybug' ],
        outputBalance: 115094890,
        outputOwnedBalance: 4000000,
        outs: [{
          amount: 111094890,
          script: 'OP_HASH160 0e3e5dec9c81e6d6d301f7f10b1bf4ad53f6b154 OP_EQUAL',
          scriptType: 'scripthash' }, {
          amount: 4000000,
          script: 'OP_HASH160 a37a2c166402eeee959d5efd34b6c9ee4f8320e7 OP_EQUAL',
          scriptType: 'scripthash'
        }]
      }
    },

    output: {
      direction: 'in',
      peers: [ '2N6PBMNjBR5n6rgGn81ZwxDzsZDp5gAqpR5' ],
      total: 4000000,
      amount: 4000000,
      fee: 166,
      feePaidByWallet: false,
      in: [{
        amount: 115095056,
        script: 'OP_HASH160 901ac31d4f62bb99522dbbf93cc067f04e861df8 OP_EQUAL',
        scriptSig: '00144425acb0273444e389d764221d484859cb6bbae1',
        scriptType: 'scripthash',
        transaction: 'f3ebef153460929874f4185cf6a51035f8b657e7478fd4bb1711b907037b5ba6',
        outputIndex: 0,
        sequence: 4294967294
      }],
      out: [{
        amount: 111094890,
        script: 'OP_HASH160 0e3e5dec9c81e6d6d301f7f10b1bf4ad53f6b154 OP_EQUAL',
        scriptType: 'scripthash' }, {
        amount: 4000000,
        script: 'OP_HASH160 a37a2c166402eeee959d5efd34b6c9ee4f8320e7 OP_EQUAL',
        scriptType: 'scripthash'
      }]
    }
  }, {
    hash: 'fff7dc7c41fa567eec37a489c2f4d358649047c24cf4beac19771f239c9fd7f2',

    input: {
      inputData: {
        inputExternalAddresses: [ '2N2Gfd8EqVuXt1kmmfd7LHwj8DrFTfLkBxh' ],
        inputBalance: 51779752264,
        inputOwnedBalance: 0,
        allInputOwned: false,
        ins: [{
          amount: 51779752264,
          script: 'OP_HASH160 62fef27bf70f7d1c014459db068b044deef21351 OP_EQUAL',
          scriptSig: '0014e858f0befcf5519d62d3ac5cc7ff181a29cbc6ab',
          scriptType: 'scripthash',
          transaction: '20d3956f6bdecf20a3261ab57a6ccdd4511c224f1f11a2cd8e932072e497ebaa',
          outputIndex: 1,
          sequence: 4294967295
        }]
      },
      outputData: { outputExternalAddresses: [ '2MsRgGYvdPbMPRskBLsPsZVc46FQxKL5NMZ' ],
        outputBalance: 51779652264,
        outputOwnedBalance: 32500000,
        outs: [{
          amount: 32500000,
          script: 'OP_HASH160 a37a2c166402eeee959d5efd34b6c9ee4f8320e7 OP_EQUAL',
          scriptType: 'scripthash' }, {
          amount: 51747152264,
          script: 'OP_HASH160 01fa18f279af6f4a7e2b4c59fad15e982d257111 OP_EQUAL',
          scriptType: 'scripthash'
        }]
      }
    },

    output: {
      direction: 'in',
      peers: [ '2N2Gfd8EqVuXt1kmmfd7LHwj8DrFTfLkBxh' ],
      total: 32500000,
      amount: 32500000,
      fee: 100000,
      feePaidByWallet: false,
      in: [{
        amount: 51779752264,
        script: 'OP_HASH160 62fef27bf70f7d1c014459db068b044deef21351 OP_EQUAL',
        scriptSig: '0014e858f0befcf5519d62d3ac5cc7ff181a29cbc6ab',
        scriptType: 'scripthash',
        transaction: '20d3956f6bdecf20a3261ab57a6ccdd4511c224f1f11a2cd8e932072e497ebaa',
        outputIndex: 1,
        sequence: 4294967295
      }],
      out: [{
        amount: 32500000,
        script: 'OP_HASH160 a37a2c166402eeee959d5efd34b6c9ee4f8320e7 OP_EQUAL',
        scriptType: 'scripthash' }, {
        amount: 51747152264,
        script: 'OP_HASH160 01fa18f279af6f4a7e2b4c59fad15e982d257111 OP_EQUAL',
        scriptType: 'scripthash'
      }]
    }
  }, {
    hash: 'a6a65b8f577c5f9f9b7e27914fba598fa1cae89e17a37e67727d6b21346858de',

    input: {
      inputData: {
        inputExternalAddresses: [ 'mxAGUxWUwiwp8YBp2fdF6NP7EM46h82UM2' ],
        inputBalance: 48979975,
        inputOwnedBalance: 0,
        allInputOwned: false,
        ins: [{
          amount: 48979975,
          script: 'OP_DUP OP_HASH160 b69095f0926b50308abd042951af0eb8ff42f405 OP_EQUALVERIFY OP_CHECKSIG',
          scriptSig: '3045022100a3c73257ab0ed5adbbe530537a5db21b57756cde1c9bbb449faf382c8567a93e022069ffb5324783ed2bffdfedd008c8dac3d395f51db889457b135195db905f859b01 02eab2aeea2810b546111a29007e1cc75935228f52c63dbd6ccdeaa0f3129d7c1c',
          scriptType: 'pubkeyhash',
          transaction: 'ecd081867eaa667607ab3b6dd5fc1c897517acb3b2e32fd633dece96dae6eaef',
          outputIndex: 1,
          sequence: 4294967295
        }]
      },
      outputData: {
        outputExternalAddresses: [ 'miT9f6gsBYd2gaGjb34X8VJBRF8n8vhyuj' ],
        outputBalance: 48960535,
        outputOwnedBalance: 50000,
        outs: [{
          amount: 50000,
          script: 'OP_HASH160 11f76f9e3ac76076a11e3da93a0e114bcf87054e OP_EQUAL',
          scriptType: 'scripthash' }, {
          amount: 48910535,
          script: 'OP_DUP OP_HASH160 203032dfca01bae143e011f26cdd6091822e0bcd OP_EQUALVERIFY OP_CHECKSIG',
          scriptType: 'pubkeyhash'
        }]
      }
    },

    output: {
      direction: 'in',
      peers: [ 'mxAGUxWUwiwp8YBp2fdF6NP7EM46h82UM2' ],
      total: 50000,
      amount: 50000,
      fee: 19440,
      feePaidByWallet: false,
      in: [{
        amount: 48979975,
        script: 'OP_DUP OP_HASH160 b69095f0926b50308abd042951af0eb8ff42f405 OP_EQUALVERIFY OP_CHECKSIG',
        scriptSig: '3045022100a3c73257ab0ed5adbbe530537a5db21b57756cde1c9bbb449faf382c8567a93e022069ffb5324783ed2bffdfedd008c8dac3d395f51db889457b135195db905f859b01 02eab2aeea2810b546111a29007e1cc75935228f52c63dbd6ccdeaa0f3129d7c1c',
        scriptType: 'pubkeyhash',
        transaction: 'ecd081867eaa667607ab3b6dd5fc1c897517acb3b2e32fd633dece96dae6eaef',
        outputIndex: 1,
        sequence: 4294967295
      }],
      out: [{
        amount: 50000,
        script: 'OP_HASH160 11f76f9e3ac76076a11e3da93a0e114bcf87054e OP_EQUAL',
        scriptType: 'scripthash' }, {
        amount: 48910535,
        script: 'OP_DUP OP_HASH160 203032dfca01bae143e011f26cdd6091822e0bcd OP_EQUALVERIFY OP_CHECKSIG',
        scriptType: 'pubkeyhash'
      }]
    }
  }]
}

module.exports = {
  hexToTransaction,
  inputs,
  outputs,
  parseTransactionIO,
  isAddressOwned,
  NETWORK
}
