import express from 'express'
import { generateQuiz, generateFromContext, submitQuiz } from '../controllers/quizController.js'

const router = express.Router()

router.get('/generate', generateQuiz)
router.post('/generate-from-context', generateFromContext)
router.post('/submit', submitQuiz)

export default router
