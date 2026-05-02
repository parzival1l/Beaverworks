import app from './app'

const PORT = Number(process.env.PORT) || 3002

app.listen(PORT, () => {
  console.log(`Beaverworks API running on http://localhost:${PORT}`)
})
