import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.WEB_ORIGIN?.split(',') || '*', credentials: true }))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

const port = Number(process.env.PORT || 4000)
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce'

async function start() {
  try {
    await mongoose.connect(mongoUri)
    app.listen(port, () => console.log(`API listening on :${port}`))
  } catch (err) {
    console.error('Failed to start API', err)
    process.exit(1)
  }
}

start()
