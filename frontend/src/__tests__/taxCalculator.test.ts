import {
  getAbove200CreditRate,
  getDonationGap,
  getEffectiveDiscountRate,
  getNetCost,
  getOptimalDonation,
  getOptimizationScore,
  getTaxRebate,
} from '../lib/taxCalculator'
import { describe, expect, it } from 'vitest'

describe('getAbove200CreditRate', () => {
  it('returns 53% below top federal donation threshold', () => {
    expect(getAbove200CreditRate(130_000)).toBe(0.53)
  })

  it('returns 57% at or above $246,752 income', () => {
    expect(getAbove200CreditRate(246_752)).toBe(0.57)
  })
})

describe('getTaxRebate', () => {
  it('returns $70 for a $200 donation at $130k income', () => {
    expect(getTaxRebate(130_000, 200)).toBe(70)
  })

  it('returns $2,031 for a $3,900 donation at $130k income', () => {
    expect(getTaxRebate(130_000, 3_900)).toBe(2031)
  })

  it('returns $0 for $0 donation', () => {
    expect(getTaxRebate(130_000, 0)).toBe(0)
  })
})

describe('getNetCost', () => {
  it('net cost of $3,900 at $130k is $1,869', () => {
    expect(getNetCost(130_000, 3_900)).toBe(1869)
  })
})

describe('getOptimalDonation', () => {
  it('returns $3,900 for $130k income', () => {
    expect(getOptimalDonation(130_000)).toBe(3_900)
  })

  it('floors at $201 for very low incomes', () => {
    expect(getOptimalDonation(5_000)).toBe(201)
  })
})

describe('getEffectiveDiscountRate', () => {
  it('returns 52% for $3,900 at $130k', () => {
    expect(getEffectiveDiscountRate(130_000, 3_900)).toBe(52)
  })
})

describe('getDonationGap', () => {
  it('returns positive gap when below optimal', () => {
    expect(getDonationGap(130_000, 2_000)).toBe(1_900)
  })

  it('returns zero when exactly at optimal', () => {
    expect(getDonationGap(130_000, 3_900)).toBe(0)
  })

  it('returns negative when above optimal', () => {
    expect(getDonationGap(130_000, 5_000)).toBe(-1_100)
  })
})

describe('getOptimizationScore', () => {
  it('returns 0 when optimal is 0', () => {
    expect(getOptimizationScore(100, 0)).toBe(0)
  })

  it('returns exactly 100 at optimal', () => {
    expect(getOptimizationScore(3_900, 3_900)).toBe(100)
  })

  it('returns > 100 when donation exceeds optimal', () => {
    expect(getOptimizationScore(5_000, 3_900)).toBe(128)
  })
})
