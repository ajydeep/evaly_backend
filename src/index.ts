import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'


dotenv.config()

import authRoutes from './routes/auth.routes'
import questionRoutes from './routes/question.routes'
import sessionRoutes from './routes/session.routes'
import attemptRoutes from './routes/attempt.routes'

const app = express()
const PORT = process.env.PORT || 5001



app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))


app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }))

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/questions', questionRoutes)
app.use('/api/v1/sessions', sessionRoutes)
app.use('/api/v1/attempts', attemptRoutes)

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.path} not found` }))

app.listen(PORT, () => {
  console.log(`---> M2 API running → http://localhost:${PORT}`)
  console.log(`---> Environment: ${process.env.NODE_ENV}`)
}) 