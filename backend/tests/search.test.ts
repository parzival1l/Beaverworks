import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import request from 'supertest'

import app from '../src/app'
import { setBotClient, type BotClient } from '../src/bot/client'
import { resetCharityMetadataCache } from '../src/data/charities'
import type { BotSearchResponse, CharityRecord } from '../src/types/search'

const VALID_ANSWERS = {
  causes: 'Environment & Climate',
  beneficiaries: 'Children & Youth',
  geography: 'Quebec',
  givingStyle: 'One-time donation',
}

const FAKE_CHARITY: CharityRecord = {
  id: 'fake-1',
  bnRegistrationNumber: '000000000 RR 0001',
  organizationName: 'Fake Charity',
  charityStatus: 'Active',
  typeOfQualifiedDonee: 'Charitable Organization',
  effectiveDateOfStatus: '2020-01-01',
  description: 'A fixture used in tests.',
  sanction: 'None',
  designation: 'Charitable organization',
  charityType: 'Test charity',
  category: 'Test',
  address: '1 Test Lane',
  city: 'Montreal',
  provinceTerritory: 'Quebec',
  country: 'Canada',
  postalCode: 'H0H 0H0',
  financial: {
    totalRevenue: 100,
    totalExpenses: 90,
    totalAssets: 200,
    totalLiabilities: 50,
    charitableExpenditure: 70,
    fundraisingExpenditure: 10,
    managementExpenditure: 10,
    fiscalYearEnd: '2024-12-31',
  },
  tags: ['test'],
}

function installFakeMetadata(records: CharityRecord[]): string {
  const dir = join(tmpdir(), `charities-meta-${Date.now()}-${Math.random()}`)
  mkdirSync(dir, { recursive: true })
  const path = join(dir, 'charities.metadata.json')
  const map: Record<string, CharityRecord> = {}
  for (const r of records) map[r.id] = r
  writeFileSync(path, JSON.stringify(map))
  process.env.CHARITIES_METADATA_PATH = path
  resetCharityMetadataCache()
  return path
}

function installBotClient(impl: BotClient['runSearch']): void {
  setBotClient({ runSearch: impl })
}

describe('POST /api/search', () => {
  beforeEach(() => {
    installFakeMetadata([FAKE_CHARITY])
  })

  it('returns 200 with hydrated charity records, scores, and rationales', async () => {
    installBotClient(async (req): Promise<BotSearchResponse> => {
      expect(req.answers).toEqual(VALID_ANSWERS)
      expect(req.prompt).toBe('Help me support kids in Montreal')
      return {
        queryId: 'q-123',
        results: [
          {
            charityId: 'fake-1',
            organizationName: 'Fake Charity',
            score: 1,
            rationale: 'Matches because it serves families in Montreal.',
          },
        ],
      }
    })

    const res = await request(app)
      .post('/api/search')
      .send({
        answers: VALID_ANSWERS,
        prompt: 'Help me support kids in Montreal',
      })

    expect(res.status).toBe(200)
    expect(res.body.queryId).toBe('q-123')
    expect(res.body.results).toHaveLength(1)
    expect(res.body.results[0].charity.id).toBe('fake-1')
    expect(res.body.results[0].charity.organizationName).toBe('Fake Charity')
    expect(res.body.results[0].score).toBe(1)
    expect(res.body.results[0].rationale).toMatch(/Montreal/)
  })

  it('drops result items whose charityId is not in the metadata map', async () => {
    installBotClient(async () => ({
      queryId: 'q-456',
      results: [
        {
          charityId: 'unknown-id',
          organizationName: 'Ghost',
          score: 0.5,
          rationale: 'n/a',
        },
        {
          charityId: 'fake-1',
          organizationName: 'Fake Charity',
          score: 0.4,
          rationale: 'ok',
        },
      ],
    }))

    const res = await request(app)
      .post('/api/search')
      .send({ answers: VALID_ANSWERS, prompt: 'anything' })

    expect(res.status).toBe(200)
    expect(res.body.results).toHaveLength(1)
    expect(res.body.results[0].charity.id).toBe('fake-1')
  })

  it('returns 400 when prompt is missing', async () => {
    installBotClient(async () => ({ queryId: 'x', results: [] }))
    const res = await request(app)
      .post('/api/search')
      .send({ answers: VALID_ANSWERS })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/prompt/i)
  })

  it('returns 400 when prompt is empty whitespace', async () => {
    installBotClient(async () => ({ queryId: 'x', results: [] }))
    const res = await request(app)
      .post('/api/search')
      .send({ answers: VALID_ANSWERS, prompt: '   ' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/prompt/i)
  })

  it('returns 400 when answers field is missing', async () => {
    installBotClient(async () => ({ queryId: 'x', results: [] }))
    const res = await request(app)
      .post('/api/search')
      .send({ prompt: 'hi' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/answers/i)
  })

  it('returns 400 when a required answers key is missing', async () => {
    installBotClient(async () => ({ queryId: 'x', results: [] }))
    const res = await request(app)
      .post('/api/search')
      .send({
        answers: { causes: 'Environment', beneficiaries: 'Kids' },
        prompt: 'hi',
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/geography|givingStyle/)
  })

  it('returns 502 when the bot client throws', async () => {
    installBotClient(async () => {
      throw new Error('adk binary not found')
    })

    const res = await request(app)
      .post('/api/search')
      .send({ answers: VALID_ANSWERS, prompt: 'hi' })

    expect(res.status).toBe(502)
    expect(res.body.error).toMatch(/searchCharities workflow failed/)
    expect(res.body.error).toMatch(/adk binary not found/)
  })

  it('falls back to a generated queryId when the workflow returns none', async () => {
    installBotClient(async () => ({ queryId: '', results: [] }))
    const res = await request(app)
      .post('/api/search')
      .send({ answers: VALID_ANSWERS, prompt: 'hi' })

    expect(res.status).toBe(200)
    expect(typeof res.body.queryId).toBe('string')
    expect(res.body.queryId.length).toBeGreaterThan(0)
  })
})
