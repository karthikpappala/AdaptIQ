import UserProfile from '../models/UserProfile.js'

// POST /api/users/register
export async function registerUser(req, res) {
    try {
        const { email, name, staticProfile, preferences } = req.body

        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name are required.' })
        }

        // Check if user already exists (returning user)
        const existing = await UserProfile.findOne({ email: email.toLowerCase() })
        if (existing) {
            return res.status(200).json({
                message: 'Welcome back!',
                returning: true,
                user: sanitizeUser(existing),
            })
        }

        // Create new user
        const user = new UserProfile({
            email: email.toLowerCase(),
            name,
            staticProfile: staticProfile || {},
            preferences: preferences || {},
        })

        await user.save()

        return res.status(201).json({
            message: 'Profile created successfully.',
            returning: false,
            user: sanitizeUser(user),
        })
    } catch (err) {
        console.error('registerUser error:', err)
        res.status(500).json({ error: 'Failed to create user profile.' })
    }
}

// PUT /api/users/:id/assessment
export async function updateAssessment(req, res) {
    try {
        const { id } = req.params
        const { goals, staticProfile, preferences } = req.body

        const user = await UserProfile.findById(id)
        if (!user) return res.status(404).json({ error: 'User not found.' })

        if (goals) user.goals = { ...user.goals.toObject?.() || {}, ...goals }
        if (staticProfile) user.staticProfile = { ...user.staticProfile.toObject?.() || {}, ...staticProfile }
        if (preferences) user.preferences = { ...user.preferences.toObject?.() || {}, ...preferences }

        if (req.body.name) user.name = req.body.name
        if (req.body.profilePic) user.profilePic = req.body.profilePic

        user.assessmentCompleted = true
        await user.save()

        return res.status(200).json({ message: 'Assessment saved.', user: sanitizeUser(user) })
    } catch (err) {
        console.error('updateAssessment error:', err)
        res.status(500).json({ error: 'Failed to update assessment.' })
    }
}

// GET /api/users/:id
export async function getUserById(req, res) {
    try {
        const user = await UserProfile.findById(req.params.id)
        if (!user) return res.status(404).json({ error: 'User not found.' })
        res.status(200).json({ user: sanitizeUser(user) })
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user.' })
    }
}

// GET /api/users/email/:email
export async function getUserByEmail(req, res) {
    try {
        const user = await UserProfile.findOne({ email: req.params.email.toLowerCase() })
        if (!user) return res.status(404).json({ error: 'User not found.' })
        res.status(200).json({ user: sanitizeUser(user) })
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user.' })
    }
}

// PUT /api/users/:id/profile-summary
export async function updateProfileSummary(req, res) {
    try {
        const { recentSummary } = req.body
        const user = await UserProfile.findByIdAndUpdate(
            req.params.id,
            { recentSummary },
            { new: true }
        )
        if (!user) return res.status(404).json({ error: 'User not found.' })
        res.status(200).json({ message: 'Summary updated.', user: sanitizeUser(user) })
    } catch (err) {
        res.status(500).json({ error: 'Failed to update summary.' })
    }
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
    try {
        const { id } = req.params
        const user = await UserProfile.findByIdAndDelete(id)
        if (!user) return res.status(404).json({ error: 'User not found.' })
        res.status(200).json({ message: 'Account deleted successfully.' })
    } catch (err) {
        console.error('deleteUser error:', err)
        res.status(500).json({ error: 'Failed to delete account.' })
    }
}

// Remove sensitive fields before sending to frontend
function sanitizeUser(user) {
    const obj = user.toObject()
    return obj
}
