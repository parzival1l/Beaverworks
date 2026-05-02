import {
  buildContent,
  buildMarkdown,
  csvRowsToRecords,
  indexCharities,
  parseCsv,
  type CharityRecord,
} from '../../scripts/ingest-charities'

const SAMPLE: CharityRecord = {
  id: 'sample-1',
  bnRegistrationNumber: '123 RR 0001',
  organizationName: 'Sample Org',
  charityStatus: 'Active',
  typeOfQualifiedDonee: 'Charitable Organization',
  effectiveDateOfStatus: '2020-01-01',
  description: 'Helps families in Quebec.',
  sanction: 'None',
  designation: 'Charitable organization',
  charityType: 'Health charity',
  category: 'Health & Wellbeing',
  address: '1 Rue Test',
  city: 'Montreal',
  provinceTerritory: 'Quebec',
  country: 'Canada',
  postalCode: 'H1A 1A1',
  financial: {
    totalRevenue: 1000000,
    totalExpenses: 900000,
    totalAssets: 1500000,
    totalLiabilities: 200000,
    charitableExpenditure: 700000,
    fundraisingExpenditure: 100000,
    managementExpenditure: 100000,
    fiscalYearEnd: '2024-12-31',
  },
  tags: ['health', 'families', 'quebec'],
}

describe('buildContent', () => {
  it('produces a single text blob containing the org, description, location, and tags', () => {
    const text = buildContent(SAMPLE)
    expect(text).toContain('Sample Org')
    expect(text).toContain('Helps families in Quebec.')
    expect(text).toContain('Montreal')
    expect(text).toContain('Quebec')
    expect(text).toContain('health, families, quebec')
    expect(text).toContain('Health charity')
  })
})

describe('indexCharities', () => {
  it('preserves id and full record in metadata while embedding text in content', () => {
    const [indexed] = indexCharities([SAMPLE])
    expect(indexed.id).toBe('sample-1')
    expect(indexed.organizationName).toBe('Sample Org')
    expect(indexed.metadata).toEqual(SAMPLE)
    expect(indexed.content).toBe(buildContent(SAMPLE))
  })

  it('preserves order and length', () => {
    const a = { ...SAMPLE, id: 'a' }
    const b = { ...SAMPLE, id: 'b' }
    const indexed = indexCharities([a, b])
    expect(indexed.map((i) => i.id)).toEqual(['a', 'b'])
  })
})

describe('buildMarkdown', () => {
  it('contains the charity id, name, location, tags, and financials', () => {
    const md = buildMarkdown(SAMPLE)
    expect(md).toMatch(/^# Sample Org/)
    expect(md).toContain('`sample-1`')
    expect(md).toContain('Montreal, Quebec, Canada')
    expect(md).toContain('health, families, quebec')
    expect(md).toContain('$1,000,000')
    expect(md).toContain('Fiscal year end: 2024-12-31')
  })
})

describe('parseCsv', () => {
  it('parses simple rows', () => {
    expect(parseCsv('a,b,c\n1,2,3\n')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ])
  })

  it('handles quoted cells with commas', () => {
    expect(parseCsv('a,b\n"hello, world",2\n')).toEqual([
      ['a', 'b'],
      ['hello, world', '2'],
    ])
  })

  it('handles escaped quotes', () => {
    expect(parseCsv('a\n"she said ""hi"""\n')).toEqual([
      ['a'],
      ['she said "hi"'],
    ])
  })
})

describe('csvRowsToRecords', () => {
  const HEADER = [
    'id', 'bnRegistrationNumber', 'organizationName', 'charityStatus',
    'typeOfQualifiedDonee', 'effectiveDateOfStatus', 'description', 'sanction',
    'designation', 'charityType', 'category', 'address', 'city',
    'provinceTerritory', 'country', 'postalCode', 'totalRevenue',
    'totalExpenses', 'totalAssets', 'totalLiabilities', 'charitableExpenditure',
    'fundraisingExpenditure', 'managementExpenditure', 'fiscalYearEnd', 'tags',
  ]

  it('coerces money fields to numbers and splits tags on `;`', () => {
    const row = [
      'csv-1', '999 RR 0001', 'CSV Org', 'Active', 'Charitable Organization',
      '2019-01-01', 'desc', 'None', 'Charitable organization', 'Health charity',
      'Health', 'addr', 'Quebec City', 'Quebec', 'Canada', 'G1A 1A1',
      '$1,234,567', '1000000', '2000000', '500000',
      '900000', '100000', '50000', '2024-12-31', 'health;quebec',
    ]
    const [rec] = csvRowsToRecords([HEADER, row])
    expect(rec.id).toBe('csv-1')
    expect(rec.financial.totalRevenue).toBe(1234567)
    expect(rec.financial.totalExpenses).toBe(1000000)
    expect(rec.tags).toEqual(['health', 'quebec'])
  })

  it('returns [] for header-only input', () => {
    expect(csvRowsToRecords([HEADER])).toEqual([])
  })
})
