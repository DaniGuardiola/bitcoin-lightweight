import { Big } from 'big.js'

// decimal places should be more than enough to correctly
// show a millisatoshi amount in MBTC unit
Big.DP = 20

interface IAmount {
  n: Big
  unit: string
}

const UNIT_FACTORS = { // where 1 = 1 btc
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

const UNIT_ALIASES = {
  msat: 'millisatoshi',
  sat: 'satoshi',
  satoshis: 'satoshi',
  bit: 'micro',
  bits: 'micro',
  μbtc: 'micro',
  millibit: 'milli',
  millibits: 'milli',
  mbtc: 'milli',
  millie: 'milli',
  bitcent: 'centi',
  bitcents: 'centi',
  cbtc: 'centi',
  dbtc: 'deci',
  btc: 'coin',
  bitcoin: 'coin',
  bitcoins: 'coin',
  dabtc: 'deca',
  hbtc: 'hecto',
  kbtc: 'kilo',
  MBTC: 'mega'
}

function getUnitFactor (unit: string): Big {
  const capsAlias = UNIT_ALIASES[unit]
  if (capsAlias) {
    unit = capsAlias
  } else {
    const alias = UNIT_ALIASES[unit.toLowerCase()]
    if (alias) unit = alias
  }

  const factor: number = UNIT_FACTORS[unit.toLowerCase()]
  if (!factor) throw new Error(`Unknown unit '${unit}'`)
  return new Big(factor)
}

function transformUnit (amount: IAmount, to: string): number {
  const fromFactor = getUnitFactor(amount.unit)
  const toFactor = getUnitFactor(to)
  const factor = toFactor.div(fromFactor)

  return +amount.n.times(factor).toPrecision()
}

function transformFactor (amount: IAmount, targetFactor: Big): number {
  const fromFactor = getUnitFactor(amount.unit)
  const factor = targetFactor.div(fromFactor)

  return +amount.n.times(factor).toPrecision()
}

export function convert (n: number, unit: string): {
  to: (targetUnit: string) => number
  toFactor: (targetFactor: number) => number
} {

  const amount = { n: new Big(n), unit }
  return {
    to: targetUnit => transformUnit(amount, targetUnit),
    toFactor: targetFactor => transformFactor(amount, new Big(targetFactor))
  }
}
