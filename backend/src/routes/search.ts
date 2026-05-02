import { Router, type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getBotClient } from '../bot/client'
import { loadCharityMetadata } from '../data/charities'
import { REQUIRED_QUESTION_IDS } from '../types/questionnaire'
import type {
  SearchRequest,
  SearchResponse,
  SearchResultItem,
} from '../types/search'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const body = req.body as Partial<SearchRequest>

  if (
    !body.answers ||
    typeof body.answers !== 'object' ||
    Array.isArray(body.answers)
  ) {
    res.status(400).json({ error: 'Missing or invalid answers field' })
    return
  }

  const missing = REQUIRED_QUESTION_IDS.filter(
    (id) =>
      !body.answers![id] || typeof body.answers![id] !== 'string',
  )
  if (missing.length > 0) {
    res
      .status(400)
      .json({ error: `Missing answers for: ${missing.join(', ')}` })
    return
  }

  if (typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
    res.status(400).json({ error: 'Missing or empty prompt field' })
    return
  }

  const request: SearchRequest = {
    answers: body.answers as SearchRequest['answers'],
    prompt: body.prompt,
    userId: body.userId,
  }

  let bot
  try {
    bot = await getBotClient().runSearch(request)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Bot client failed'
    res.status(502).json({ error: `searchCharities workflow failed: ${message}` })
    return
  }

  const metadata = loadCharityMetadata()
  const results: SearchResultItem[] = []
  for (const item of bot.results) {
    const charity = metadata[item.charityId]
    if (!charity) continue
    results.push({
      charity,
      score: item.score,
      rationale: item.rationale,
    })
  }

  const response: SearchResponse = {
    queryId: bot.queryId || uuidv4(),
    results,
  }
  res.status(200).json(response)
})

export default router
