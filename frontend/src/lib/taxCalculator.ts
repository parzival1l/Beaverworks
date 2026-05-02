/**
 * Combined federal + Quebec donation credit rate for the portion **above** $200.
 */
export function getAbove200CreditRate(income: number): number {
  if (income >= 246752) return 0.57
  return 0.53
}

/**
 * Total tax rebate for a donation (first $200 at 35%, remainder at 53% or 57%).
 */
export function getTaxRebate(income: number, donation: number): number {
  if (donation <= 0) return 0
  const first = Math.min(donation, 200) * 0.35
  const above = Math.max(0, donation - 200) * getAbove200CreditRate(income)
  return Math.round(first + above)
}

export function getNetCost(income: number, donation: number): number {
  return Math.round(donation - getTaxRebate(income, donation))
}

export function getEffectiveDiscountRate(
  income: number,
  donation: number,
): number {
  if (donation <= 0) return 0
  return Math.round((getTaxRebate(income, donation) / donation) * 100)
}

export function getOptimalDonation(income: number): number {
  return Math.max(201, Math.round(income * 0.03))
}

/**
 * `optimalDonation - currentDonation` in CAD: positive = below optimal,
 * negative = above optimal, zero = at optimal.
 */
export function getDonationGap(income: number, currentDonation: number): number {
  return getOptimalDonation(income) - currentDonation
}

/**
 * Percentage of optimal (uncapped — values &gt; 100 mean above optimal).
 */
export function getOptimizationScore(
  currentDonation: number,
  optimalDonation: number,
): number {
  if (optimalDonation <= 0) return 0
  return Math.round((currentDonation / optimalDonation) * 100)
}
