import {
  getDonationCreditRate,
  getFederalMarginalRate,
  getOptimalDonationAmount,
  getQuebecMarginalRate,
  getTaxSaved,
} from '../lib/taxCalculator'
import { describe, expect, it } from 'vitest'

describe('taxCalculator', () => {
  it('gets correct federal bracket for $130k', () => {
    expect(getFederalMarginalRate(130000)).toBe(0.26)
  })

  it('gets correct Quebec bracket for $130k', () => {
    expect(getQuebecMarginalRate(130000)).toBe(0.2575)
  })

  it('gets correct combined credit rate above $200', () => {
    expect(getDonationCreditRate(130000, 3900)).toBe(0.53)
  })

  it('returns optimal donation for $130k income', () => {
    expect(getOptimalDonationAmount(130000)).toBe(3900)
  })

  it('calculates expected tax saved for $130k and $3900 donation', () => {
    expect(getTaxSaved(130000, 3900)).toBe(2031)
  })
})
