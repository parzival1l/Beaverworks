import app from './app'

const PORT = Number(process.env.PORT) || 3002

app.listen(PORT, () => {
  console.log(`Altru API running on http://localhost:${PORT}`)
})
