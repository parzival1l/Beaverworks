import { mapCraRowToCharity } from '../../../src/parsers/cra-charities/actions/mapCraRowToCharity'
import type { CraRow } from '../../../src/parsers/cra-charities/schemas'

const BASE_ROW: CraRow = {
  bnRegistrationNumber: '750231003RR0001',
  organizationName: 'iGlobe Health Foundation',
  status: 'Registered',
  typeOfQualifiedDonee: 'Charity',
  effectiveDateOfStatus: '2023-01-01',
  sanction: '',
  designationCode: '0001',
  charityType: 'Other purposes beneficial to the community',
  categoryCode: '0110',
  address: '6 - 20 MAGNETIC DR',
  city: 'NORTH YORK',
  provinceTerritory: 'ON',
  country: 'CA',
  postalCode: 'M3J2C4',
}

describe('mapCraRowToCharity', () => {
  it('maps the canonical CRA row to a seed CharityRecord', () => {
    const rec = mapCraRowToCharity(BASE_ROW)

    expect(rec.id).toBe('bn-750231003-rr0001')
    expect(rec.bnRegistrationNumber).toBe('750231003 RR 0001')
    expect(rec.organizationName).toBe('iGlobe Health Foundation')
    expect(rec.charityStatus).toBe('Active')
    expect(rec.typeOfQualifiedDonee).toBe('Charity')
    expect(rec.effectiveDateOfStatus).toBe('2023-01-01')
    expect(rec.sanction).toBe('None')
    expect(rec.designation).toBe('Charitable organization')
    expect(rec.charityType).toBe('Other purposes beneficial to the community')
    expect(rec.category).toBe('Other purposes beneficial to the community')
    expect(rec.address).toBe('6 - 20 MAGNETIC DR')
    expect(rec.city).toBe('North York')
    expect(rec.provinceTerritory).toBe('Ontario')
    expect(rec.country).toBe('Canada')
    expect(rec.postalCode).toBe('M3J 2C4')
  })

  it('maps designation codes 0001/0002/0003 to the correct text', () => {
    const co = mapCraRowToCharity({ ...BASE_ROW, designationCode: '0001' })
    const pub = mapCraRowToCharity({ ...BASE_ROW, designationCode: '0002' })
    const priv = mapCraRowToCharity({ ...BASE_ROW, designationCode: '0003' })
    expect(co.designation).toBe('Charitable organization')
    expect(pub.designation).toBe('Public foundation')
    expect(priv.designation).toBe('Private foundation')
  })

  it('maps CRA status Revoked-* to a human-readable status', () => {
    const voluntary = mapCraRowToCharity({ ...BASE_ROW, status: 'Revoked-Voluntary' })
    const failure = mapCraRowToCharity({ ...BASE_ROW, status: 'Revoked-Failure to File' })
    expect(voluntary.charityStatus).toBe('Revoked (voluntary)')
    expect(failure.charityStatus).toBe('Revoked (failure to file)')
  })

  it('synthesizes plausible financials that satisfy the natural invariants', () => {
    const rec = mapCraRowToCharity(BASE_ROW)
    const f = rec.financial
    expect(f.totalRevenue).toBeGreaterThan(0)
    expect(f.totalExpenses).toBeGreaterThan(0)
    expect(f.totalExpenses).toBeLessThanOrEqual(f.totalRevenue)
    expect(f.totalAssets).toBeGreaterThanOrEqual(f.totalRevenue)
    expect(f.totalLiabilities).toBeLessThan(f.totalAssets)
    const breakdownSum =
      f.charitableExpenditure + f.fundraisingExpenditure + f.managementExpenditure
    expect(breakdownSum).toBe(f.totalExpenses)
    expect(f.fiscalYearEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('emits deterministic financials for the same BN across runs', () => {
    const a = mapCraRowToCharity(BASE_ROW)
    const b = mapCraRowToCharity(BASE_ROW)
    expect(a.financial).toEqual(b.financial)
  })

  it('differentiates financials between distinct BNs', () => {
    const a = mapCraRowToCharity(BASE_ROW)
    const b = mapCraRowToCharity({
      ...BASE_ROW,
      bnRegistrationNumber: '999999999RR0001',
    })
    expect(a.financial.totalRevenue).not.toBe(b.financial.totalRevenue)
  })

  it('derives tags from city, province, category, and charity type', () => {
    const rec = mapCraRowToCharity(BASE_ROW)
    expect(rec.tags).toEqual(expect.arrayContaining(['canada', 'ontario', 'north-york']))
    expect(rec.tags.some((t) => t.includes('community'))).toBe(true)
  })

  it('generates a short description from available metadata', () => {
    const rec = mapCraRowToCharity(BASE_ROW)
    expect(rec.description).toContain('North York')
    expect(rec.description).toContain('Ontario')
    expect(rec.description.length).toBeGreaterThan(0)
  })

  it('preserves compact postal codes that are already spaced', () => {
    const rec = mapCraRowToCharity({ ...BASE_ROW, postalCode: 'M3J 2C4' })
    expect(rec.postalCode).toBe('M3J 2C4')
  })
})
