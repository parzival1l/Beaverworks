import request from 'supertest'
import app from '../src/app'

const VALID_ANSWERS = {
  causes: 'Environment',
  beneficiaries: 'Children & Youth',
  geography: 'Quebec',
  givingStyle: 'One-time donation',
}

describe('POST /api/questionnaire/submit', () => {
  it('returns 200 with submissionId for a complete submission', async () => {
    const res = await request(app)
      .post('/api/questionnaire/submit')
      .send({ answers: VALID_ANSWERS })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(typeof res.body.submissionId).toBe('string')
    expect(res.body.submissionId.length).toBeGreaterThan(0)
    expect(res.body.answers).toEqual(VALID_ANSWERS)
  })

  it('accepts an optional userId without error', async () => {
    const res = await request(app)
      .post('/api/questionnaire/submit')
      .send({ answers: VALID_ANSWERS, userId: 'user-123' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('returns 400 when the answers field is missing', async () => {
    const res = await request(app).post('/api/questionnaire/submit').send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('returns 400 when answers is not an object', async () => {
    const res = await request(app)
      .post('/api/questionnaire/submit')
      .send({ answers: 'not-an-object' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('returns 400 when not all four questions are answered', async () => {
    const res = await request(app)
      .post('/api/questionnaire/submit')
      .send({ answers: { causes: 'Environment', beneficiaries: 'Children & Youth' } })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/geography|givingStyle/)
  })

  it('returns a unique submissionId for each submission', async () => {
    const [res1, res2] = await Promise.all([
      request(app).post('/api/questionnaire/submit').send({ answers: VALID_ANSWERS }),
      request(app).post('/api/questionnaire/submit').send({ answers: VALID_ANSWERS }),
    ])

    expect(res1.body.submissionId).not.toBe(res2.body.submissionId)
  })
})
