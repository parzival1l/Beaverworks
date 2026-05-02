import { parseCraTsv } from '../../../src/parsers/cra-charities/actions/parseCraTsv'

const HEADER =
  'BN/Registration number:\tOrganization name:\tStatus: \tType of qualified donee:\t' +
  'Effective date of status:\tSanction \tDesignation: \tCharity type: \tCategory: \t' +
  'Address:\tCity:\tProvince, territory, outside of Canada:\tCountry:\t' +
  'Postal code/Zip code:\t'

const ROW_REGISTERED =
  '750231003RR0001\tiGlobe Health Foundation\tRegistered\tCharity\t2023-01-01\t\t' +
  '0001\tOther purposes beneficial to the community\t0110\t6 - 20 MAGNETIC DR \t' +
  'NORTH YORK\tON\tCA\tM3J2C4'

const ROW_REVOKED =
  '824882849RR0001\tiHealthSS Inc.\tRevoked-Voluntary\tCharity\t2023-12-02\t\t' +
  '0003\tOther purposes beneficial to the community\t0110\t150 GATESHEAD CRESCENT UNIT 21\t' +
  'STONEY CREEK\tON\tCA\tL8G4A7'

describe('parseCraTsv', () => {
  it('returns an empty list for empty input', () => {
    expect(parseCraTsv('')).toEqual([])
  })

  it('parses a header + single registered row', () => {
    const rows = parseCraTsv(`${HEADER}\r\n${ROW_REGISTERED}\r\n`)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
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
    })
  })

  it('parses multiple rows with mixed status', () => {
    const rows = parseCraTsv(`${HEADER}\n${ROW_REGISTERED}\n${ROW_REVOKED}\n`)
    expect(rows).toHaveLength(2)
    expect(rows[0].status).toBe('Registered')
    expect(rows[1].status).toBe('Revoked-Voluntary')
  })

  it('skips blank lines', () => {
    const rows = parseCraTsv(`${HEADER}\n\n${ROW_REGISTERED}\n\n`)
    expect(rows).toHaveLength(1)
  })

  it('throws a descriptive error if required headers are missing', () => {
    expect(() => parseCraTsv('foo\tbar\n1\t2\n')).toThrow(/header/i)
  })
})
