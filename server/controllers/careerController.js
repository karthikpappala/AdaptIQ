import UserProfile from '../models/UserProfile.js'
import { computeSkillGap, getAvailableRoles } from '../services/skillGapService.js'

// GET /api/career/gap?userId=...
export async function getCareerGap(req, res) {
    try {
        const { userId } = req.query
        if (!userId) return res.status(400).json({ error: 'userId is required.' })

        const user = await UserProfile.findById(userId)
        if (!user) return res.status(404).json({ error: 'User not found.' })

        const gapData = computeSkillGap(user)

        return res.status(200).json({ gapData })
    } catch (err) {
        console.error('getCareerGap error:', err)
        res.status(500).json({ error: 'Failed to compute skill gap.' })
    }
}

// PUT /api/career/target-role
export async function updateTargetRole(req, res) {
    try {
        const { userId, targetRole } = req.body
        if (!userId || !targetRole) return res.status(400).json({ error: 'userId and targetRole are required.' })

        const user = await UserProfile.findById(userId)
        if (!user) return res.status(404).json({ error: 'User not found.' })

        user.goals.targetRole = targetRole
        await user.save()

        const gapData = computeSkillGap(user)

        return res.status(200).json({ message: 'Target role updated.', gapData })
    } catch (err) {
        console.error('updateTargetRole error:', err)
        res.status(500).json({ error: 'Failed to update target role.' })
    }
}

// GET /api/career/roles
export async function listRoles(req, res) {
    try {
        const roles = getAvailableRoles()
        res.status(200).json({ roles })
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch roles.' })
    }
}
