import { parseCraExport } from '../../../src/parsers/cra-charities/actions/parseCraExport'

const HEADER =
  'BN/Registration number:\tOrganization name:\tStatus: \tType of qualified donee:\t' +
  'Effective date of status:\tSanction \tDesignation: \tCharity type: \tCategory: \t' +
  'Address:\tCity:\tProvince, territory, outside of Canada:\tCountry:\t' +
  'Postal code/Zip code:\t'

function row(
  bn: string,
  name: string,
  status: string,
  designation = '0001',
  province = 'ON',
): string {
  return [
    bn,
    name,
    status,
    'Charity',
    '2020-01-01',
    '',
    designation,
    'Other purposes beneficial to the community',
    '0110',
    '1 TEST ST',
    'TESTVILLE',
    province,
    'CA',
    'M1M1M1',
  ].join('\t')
}

describe('parseCraExport', () => {
  it('parses a TSV export into seed CharityRecords', () => {
    const text = [HEADER, row('111111111RR0001', 'A', 'Registered')].join('\n')
    const records = parseCraExport(text)
    expect(records).toHaveLength(1)
    expect(records[0].bnRegistrationNumber).toBe('111111111 RR 0001')
    expect(records[0].charityStatus).toBe('Active')
  })

  it('filters by status when onlyRegistered is true', () => {
    const text = [
      HEADER,
      row('111111111RR0001', 'A', 'Registered'),
      row('222222222RR0001', 'B', 'Revoked-Voluntary'),
      row('333333333RR0001', 'C', 'Registered'),
    ].join('\n')
    const all = parseCraExport(text)
    const registered = parseCraExport(text, { onlyRegistered: true })
    expect(all).toHaveLength(3)
    expect(registered).toHaveLength(2)
    expect(registered.map((r) => r.organizationName)).toEqual(['A', 'C'])
  })

  it('caps output at `limit` entries (applied after filtering)', () => {
    const rows = [HEADER]
    for (let i = 0; i < 10; i++) {
      const bn = `${String(100000000 + i).padStart(9, '0')}RR0001`
      rows.push(row(bn, `Org ${i}`, i % 3 === 0 ? 'Revoked-Voluntary' : 'Registered'))
    }
    const records = parseCraExport(rows.join('\n'), {
      onlyRegistered: true,
      limit: 3,
    })
    expect(records).toHaveLength(3)
    for (const r of records) expect(r.charityStatus).toBe('Active')
  })

  it('produces unique ids across the output', () => {
    const text = [
      HEADER,
      row('111111111RR0001', 'A', 'Registered'),
      row('222222222RR0001', 'B', 'Registered'),
    ].join('\n')
    const records = parseCraExport(text)
    const ids = new Set(records.map((r) => r.id))
    expect(ids.size).toBe(records.length)
  })
})
