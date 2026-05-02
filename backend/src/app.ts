import cors from 'cors'
import express from 'express'
import questionnaireRouter from './routes/questionnaire'
import searchRouter from './routes/search'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/questionnaire', questionnaireRouter)
app.use('/api/search', searchRouter)

export default app
