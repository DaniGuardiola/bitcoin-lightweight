export const BITCOIN_FACTORS = { // where 1 = 1 btc
  millisatoshi: 1e3,
  satoshi: 1e8,
  finney: 1e7,
  micro: 1e6,
  milli: 1e3,
  centi: 1e2,
  deci: 10,
  coin: 1,
  deca: 0.1,
  hecto: 1e-2,
  kilo: 1e-3,
  mega: 1e-6
}

export const BITCOIN_ALIASES = {
  millisatoshis: BITCOIN_FACTORS.millisatoshi,
  msat: BITCOIN_FACTORS.millisatoshi,
  sat: BITCOIN_FACTORS.satoshi,
  satoshis: BITCOIN_FACTORS.satoshi,
  finneys: BITCOIN_FACTORS.finney,
  bit: BITCOIN_FACTORS.micro,
  bits: BITCOIN_FACTORS.micro,
  μbtc: BITCOIN_FACTORS.micro,
  millibit: BITCOIN_FACTORS.milli,
  millibits: BITCOIN_FACTORS.milli,
  mbtc: BITCOIN_FACTORS.milli,
  millie: BITCOIN_FACTORS.milli,
  millies: BITCOIN_FACTORS.milli,
  bitcent: BITCOIN_FACTORS.centi,
  bitcents: BITCOIN_FACTORS.centi,
  cbtc: BITCOIN_FACTORS.centi,
  dbtc: BITCOIN_FACTORS.deci,
  coins: BITCOIN_FACTORS.coin,
  btc: BITCOIN_FACTORS.coin,
  bitcoin: BITCOIN_FACTORS.coin,
  bitcoins: BITCOIN_FACTORS.coin,
  dabtc: BITCOIN_FACTORS.deca,
  hbtc: BITCOIN_FACTORS.hecto,
  kbtc: BITCOIN_FACTORS.kilo,
  MBTC: BITCOIN_FACTORS.mega
}

export const UNITS = Object.assign({},
  BITCOIN_FACTORS,
  BITCOIN_ALIASES
)
