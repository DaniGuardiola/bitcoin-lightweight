import { UNITS } from '../data/units'

import { Big } from 'big.js'

// decimal places should be more than enough to correctly
// show a millisatoshi amount in MBTC unit
Big.DP = 20

interface IAmountRaw {
  _bigN: Big
  unit: string
  value: number
}

export interface IAmount extends IAmountRaw {
  to: (target: string, unit?: string) => IAmount
}

function getUnitFactor (unit: string): Big {
  // check raw (with caps)
  const rawUnit: number | undefined = UNITS[unit]
  if (rawUnit) return new Big(rawUnit)

  // check lowercase
  const lowercaseUnit: number = UNITS[unit.toLowerCase()]
  if (!lowercaseUnit) throw new Error(`Unknown unit '${unit}'`)
  return new Big(lowercaseUnit)
}

function transformUnit (amount: IAmountRaw, to: string): IAmountRaw {
  const fromFactor = getUnitFactor(amount.unit)
  const toFactor = getUnitFactor(to)
  const factor = toFactor.div(fromFactor)

  const _bigN = amount._bigN.times(factor)
  const unit = to
  const value = +_bigN.toPrecision()

  return {
    _bigN,
    unit,
    value
  }
}

function transformFactor (amount: IAmountRaw, targetFactor: Big, unit: string = 'custom'): IAmountRaw {
  const fromFactor = getUnitFactor(amount.unit)
  const factor = targetFactor.div(fromFactor)

  const _bigN = amount._bigN.times(factor)
  const value = +_bigN.toPrecision()

  return {
    _bigN,
    unit,
    value
  }
}

function transform (amount: IAmountRaw, target: string | number | Big, unit?: string): IAmountRaw {
  if (target instanceof Big) return transformFactor(amount, target, unit)
  if (typeof target === 'number') return transformFactor(amount, new Big(target), unit)
  return transformUnit(amount, target)
}

function buildAmount (amount: IAmountRaw) {
  return Object.assign({}, amount, {
    to: (target, unit) => buildAmount(transform(amount, target, unit)),
    toNumber: target => transform(amount, target).value
  })
}

// use it like:
// convert(5, 'bitcoin').to('mbtc')

export function convert (n: number, unit: string): IAmount {

  const amount: IAmountRaw = {
    _bigN: new Big(n),
    unit,
    value: +(new Big(n).toPrecision())
  }

  return buildAmount(amount)
}
