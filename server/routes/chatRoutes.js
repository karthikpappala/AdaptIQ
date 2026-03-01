import express from 'express'
import { sendMessage, submitFeedback, explainBack, getRegionalExplanation } from '../controllers/interactionController.js'

const router = express.Router()

router.post('/message', sendMessage)
router.post('/feedback', submitFeedback)
router.post('/explain-back', explainBack)
router.post('/regional', getRegionalExplanation)

export default router
