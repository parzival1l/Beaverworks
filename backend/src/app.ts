import express from 'express';
import cors from 'cors';
import questionnaireRouter from './routes/questionnaire';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/questionnaire', questionnaireRouter);

export default app;
