import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  SubmitQuestionnaireRequest,
  SubmitQuestionnaireResponse,
  REQUIRED_QUESTION_IDS,
} from '../types/questionnaire';

const router = Router();

router.post('/submit', (req: Request, res: Response) => {
  const body = req.body as Partial<SubmitQuestionnaireRequest>;

  if (!body.answers || typeof body.answers !== 'object' || Array.isArray(body.answers)) {
    res.status(400).json({ error: 'Missing or invalid answers field' });
    return;
  }

  const missing = REQUIRED_QUESTION_IDS.filter(
    (id) => !body.answers![id] || typeof body.answers![id] !== 'string',
  );

  if (missing.length > 0) {
    res.status(400).json({ error: `Missing answers for: ${missing.join(', ')}` });
    return;
  }

  // Answers are stored here and will be forwarded to the LLM charity-matching
  // service via the integration layer (separate feature, to be wired in later).
  const response: SubmitQuestionnaireResponse = {
    success: true,
    submissionId: uuidv4(),
    answers: body.answers,
  };

  res.status(200).json(response);
});

export default router;
