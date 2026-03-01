import express from 'express'
import { registerUser, updateAssessment, getUserById, getUserByEmail, updateProfileSummary, deleteUser } from '../controllers/userController.js'

const router = express.Router()

router.post('/register', registerUser)
router.get('/email/:email', getUserByEmail)
router.get('/:id', getUserById)
router.put('/:id/assessment', updateAssessment)
router.put('/:id/profile-summary', updateProfileSummary)
router.delete('/:id', deleteUser)

export default router
