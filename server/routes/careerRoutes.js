import express from 'express'
import { getCareerGap, updateTargetRole, listRoles } from '../controllers/careerController.js'

const router = express.Router()

router.get('/gap', getCareerGap)
router.get('/roles', listRoles)
router.put('/target-role', updateTargetRole)

export default router
