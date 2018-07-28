const bitcoin = require('bitcoinjs-lib')

const NETWORK = bitcoin.networks.bitcoin

const hdNodeToBIP49Address = {
  pass: [{
    xpriv: 'xprv9s21ZrQH143K2JF8RafpqtKiTbsbaxEeUaMnNHsm5o6wCW3z8ySyH4UxFVSfZ8n7ESu7fgir8imbZKLYVBxFPND1pniTZ81vKfd45EHKX73',
    output: '35iCf6WWk5SenuBJtaTcSrC3bqtzRW6qmX'
  }, {
    xpriv: 'xprv9s21ZrQH143K25Ju8YmSk9gxHRUTLfSSTim7yyo6NEPK2rj5mx9CFmSVYgPPxsS9nTeJiahvnz5VsHZDRtMaSjrzBXq2VTm5MX1D9yc5TKY',
    output: '3Gzx8eXcqsrMjERGvNFVFjCXLHCd4NiZS4'
  }, {
    xpriv: 'xprv9s21ZrQH143K2xyLKRcXsbC7N6HLVitzzavqEKaK3rYHJFR38zP9ABBUrM8F8Wo5ycsBocxgxjuNLxBc3BZdiSXJVAt93rAgxnDLSpQpgHG',
    output: '3Pp6e1tWM9WgN2SdQMttxDyXguRi1N72wt'
  }, {
    xpriv: 'xprv9s21ZrQH143K3HEhhzCaK5ZnGWtF7XgEWoP9egnnGcNFcp1uM1M1nt3dbrZ8hVixe5JAvJxKUFEU6B8MLq2os7q5gpaxb7oyG2y8f9CVydW',
    output: '3DkbTggH1bP6SsAQsJXfaLvHUhGTQrjph8'
  }, {
    xpriv: 'xprv9s21ZrQH143K48zyuKmwV9AvuhNxGVJY3Xtvp68hiU5pqbej4Ln5NVugCuKMzCM4zswiVtgYMHT2dEGXPwuvPDJtCFfr9Z7Wt57iyyfd5DD',
    output: '3GaiTe5HUiWydyXc8NicdjFLtx4uemhaQy'
  }, {
    xpriv: 'xprv9s21ZrQH143K3RL4oBbJNwWMPSzaWyWEB1jBHkw6MyZ8ftA9oWKGWmgzLYUo1YnRb2TuC55w4zXup41H8iS948E5ufg7EZiv9HpKkJdZrNY',
    output: '324YNbs1wgY27NHCJpExcfmnvaPKBRuZEy'
  }, {
    xpriv: 'xprv9s21ZrQH143K4atjgRzSsGQDa7NCnkn7j1Kpdmup11wPCeDASqHCBZAgu2W7dDEQFj1Fe7KtoHGDuuttnY9983tkKcR4xmHE7DzTDbbAKXG',
    output: '3C461wfWT1VSW3LVMC6d8bUuW6ZL3Nf1YP'
  }, {
    xpriv: 'xprv9s21ZrQH143K3ZvNZMNLMAPJHh1M1HfKLiWGPCtGAzXVxiSxAh9XddyT2G1bXZdggcXn1dK9YAb1fqa8h98i9gxTi4VPzPLwaRrjULuPWwk',
    output: '38JkjjGEqJYTgHAYXTgqwgZyKGGcSNhtP3'
  }],
  fail: [
    'stringformat',
    'xprv9s21ZrQH143K3ZvNZMNLMAPJHh1M1HfKLiWGPCtGAzXVxiSxAh9XddyT2G1bXZdggcXn1dK9YAb1fqa8h98i9gxTi4VPzPLwaRrjULuPWwk',
    12341234,
    { a: 4, b: 3 },
    [ 1, 2, 3 ]
  ]
}

hdNodeToBIP49Address.pass.map(item => {
  item.input = bitcoin.HDNode.fromBase58(item.xpriv)
})

const publicKeyToBIP49Address = {
  pass: [{
    pub: '023e4740d0ba639e28963f3476157b7cf2fb7c6fdf4254f97099cf8670b505ea59',
    output: '35iCf6WWk5SenuBJtaTcSrC3bqtzRW6qmX'
  }, {
    pub: '02abea795811ec7a29e17b32dd7d2c88c74d04f70833b9d95d63473b8357926d1d',
    output: '3Gzx8eXcqsrMjERGvNFVFjCXLHCd4NiZS4'
  }, {
    pub: '0345c4dd86d29f47c200e2bc4a66a00f8ed188dffffbaf8580e353593f54c399d1',
    output: '3Pp6e1tWM9WgN2SdQMttxDyXguRi1N72wt'
  }, {
    pub: '0390755390f0af23e619a9fa0ffedee27d149503597aad16da38d8b06994c021f3',
    output: '3DkbTggH1bP6SsAQsJXfaLvHUhGTQrjph8'
  }, {
    pub: '0261e804cbbeaf9a445be54d33543dca12beabbb909e5d044ab8419359a91e1da5',
    output: '3GaiTe5HUiWydyXc8NicdjFLtx4uemhaQy'
  }, {
    pub: '03ba29282184c6a0009c960dbcd96e3335610858257acdd871bffeec2914427905',
    output: '324YNbs1wgY27NHCJpExcfmnvaPKBRuZEy'
  }, {
    pub: '0243bc71b93ab8c34fc8c46d025a9c8eb2348b6b117b58cc8a304f8dafdad01573',
    output: '3C461wfWT1VSW3LVMC6d8bUuW6ZL3Nf1YP'
  }, {
    pub: '026b7267bfa8bd7565f60f05fe1cef6055eade1f0a42fa51ad8e309f1e8c1f78e2',
    output: '38JkjjGEqJYTgHAYXTgqwgZyKGGcSNhtP3'
  }],
  fail: [
    'stringformat',
    '023e4740d0ba639e28963f3476157b7cf2fb7c6fdf4254f97099cf8670b505ea59',
    12341234,
    { a: 4, b: 3 },
    [ 1, 2, 3 ]
  ]
}

publicKeyToBIP49Address.pass.map(item => {
  item.input = Buffer.from(item.pub, 'hex')
})

const addressToElectrumP2shID = {
  pass: [{
    input: '35iCf6WWk5SenuBJtaTcSrC3bqtzRW6qmX',
    output: '40936850a3a8b8e230f09cd766a3b36022f4afb55da7cec13cbaa491505252d0'
  }, {
    input: '3Gzx8eXcqsrMjERGvNFVFjCXLHCd4NiZS4',
    output: 'b918857421e60d5b117e6b2a8b62719f0b2cc640a28d58e899883f898b31fab7'
  }, {
    input: '3Pp6e1tWM9WgN2SdQMttxDyXguRi1N72wt',
    output: 'f95740fea4d5850811a57512cd5e3ad1b8698998c185329f1ceaa6df8e65b69d'
  }, {
    input: '3DkbTggH1bP6SsAQsJXfaLvHUhGTQrjph8',
    output: '8a91ca2ac68ff833d5f5294ac84edd2f0530739edeffe6c062e50a9608f4ee27'
  }, {
    input: '3GaiTe5HUiWydyXc8NicdjFLtx4uemhaQy',
    output: '0acbf6eeda1530af09d0bc7bbcec99bc06c2ac4a07b5d736bfe9bb41b3ee537f'
  }, {
    input: '324YNbs1wgY27NHCJpExcfmnvaPKBRuZEy',
    output: 'eb641dc8f1bb9446ae7870828abef7fb4cb5784a17f6af146cb98e753588642c'
  }, {
    input: '3C461wfWT1VSW3LVMC6d8bUuW6ZL3Nf1YP',
    output: 'd50fa3d679ece17d1953eecf5172fb3dc3ffc5b5e3eae9a5ae70229af201c105'
  }, {
    input: '38JkjjGEqJYTgHAYXTgqwgZyKGGcSNhtP3',
    output: '313917f056bbd87bead7e49982c2e9bc9156178347ca29d2c61c7e6282e81164'
  }],
  fail: [
    'stringformat',
    '023e4740d0ba639e28963f3476157b7cf2fb7c6fdf4254f97099cf8670b505ea59',
    12341234,
    { a: 4, b: 3 },
    [ 1, 2, 3 ]
  ]
}

module.exports = { hdNodeToBIP49Address, publicKeyToBIP49Address, addressToElectrumP2shID, NETWORK }
