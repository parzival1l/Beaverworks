import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { searchCharities } from '../api/search'
import type { Charity } from '../types/charity'

const FAKE_CHARITY: Charity = {
  id: 'fake-1',
  bnRegistrationNumber: '000 RR 0001',
  organizationName: 'Fake',
  charityStatus: 'Active',
  typeOfQualifiedDonee: 'Charitable Organization',
  effectiveDateOfStatus: '2020-01-01',
  description: 'desc',
  sanction: 'None',
  designation: 'Charitable organization',
  charityType: 'Test',
  category: 'Test',
  address: 'addr',
  city: 'Montreal',
  provinceTerritory: 'Quebec',
  country: 'Canada',
  postalCode: 'H0H 0H0',
  financial: {
    totalRevenue: 0,
    totalExpenses: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    charitableExpenditure: 0,
    fundraisingExpenditure: 0,
    managementExpenditure: 0,
    fiscalYearEnd: '2024-12-31',
  },
  tags: [],
}

const VALID_REQ = {
  answers: {
    causes: 'Environment',
    beneficiaries: 'Children & Youth',
    geography: 'Quebec',
    givingStyle: 'One-time donation',
  },
  prompt: 'Help kids in Montreal',
}

describe('searchCharities api client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('POSTs JSON to /api/search and returns the parsed response', async () => {
    const body = {
      queryId: 'q-1',
      results: [{ charity: FAKE_CHARITY, score: 0.9, rationale: 'because' }],
    }
    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await searchCharities(VALID_REQ)

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    const [url, init] = (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/search')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual(VALID_REQ)
    expect(result.queryId).toBe('q-1')
    expect(result.results).toHaveLength(1)
    expect(result.results[0].rationale).toBe('because')
  })

  it('throws with the server-provided error message on non-2xx', async () => {
    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 }),
    )

    await expect(searchCharities(VALID_REQ)).rejects.toThrow('Missing prompt')
  })

  it('throws on a malformed body', async () => {
    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ queryId: 1, results: 'nope' }), {
        status: 200,
      }),
    )

    await expect(searchCharities(VALID_REQ)).rejects.toThrow(/Invalid search response/)
  })
})
