import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'

import userRoutes from './routes/userRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import quizRoutes from './routes/quizRoutes.js'
import careerRoutes from './routes/careerRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/users', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/career', careerRoutes)
app.use('/api/upload', uploadRoutes)

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found.` })
})

// Global error handler
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`🚀 AdaptIQ server running on http://localhost:${PORT}`)
})
