import UserProfile from '../models/UserProfile.js'
import { parseUploadedConversation } from '../services/jsonParsingService.js'

// POST /api/upload/parse
export async function uploadConversation(req, res) {
    try {
        const { userId } = req.body

        if (!userId || !req.file) {
            return res.status(400).json({ error: 'userId and file are required.' })
        }

        // Parse uploaded JSON file
        let rawJson
        try {
            rawJson = JSON.parse(req.file.buffer.toString('utf-8'))
        } catch {
            return res.status(400).json({ error: 'Invalid JSON file. Please upload a valid ChatGPT or Gemini export.' })
        }

        // Extract structured profile from user messages only
        const result = await parseUploadedConversation(rawJson)

        if (!result.success) {
            return res.status(422).json({ error: result.error })
        }

        const { extracted, messageCount } = result

        // Update user profile with extracted data
        const user = await UserProfile.findById(userId)
        if (!user) return res.status(404).json({ error: 'User not found.' })

        // Store structured summary (raw conversation is discarded)
        user.uploadedProfileSummary = extracted.summary || ''

        // Update competency if extracted skill level differs
        if (extracted.estimatedSkillLevel) {
            const levelMap = { Beginner: 1, Intermediate: 3, Advanced: 5 }
            const extractedLevel = levelMap[extracted.estimatedSkillLevel]
            if (extractedLevel) {
                // Blend: take average of current level and extracted
                user.competencyMetrics.skillLevel = Math.round(
                    ((user.competencyMetrics.skillLevel + extractedLevel) / 2) * 10
                ) / 10
            }
        }

        // Update weak topics from recurring struggles
        if (extracted.recurringStruggles?.length) {
            const existing = user.competencyMetrics.weakTopics || []
            const merged = [...new Set([...existing, ...extracted.recurringStruggles.slice(0, 5)])]
            user.competencyMetrics.weakTopics = merged
        }

        // Update strong topics (proficient areas)
        if (extracted.strongTopics?.length) {
            const existing = user.competencyMetrics.strongTopics || []
            const merged = [...new Set([...existing, ...extracted.strongTopics.slice(0, 5)])]
            user.competencyMetrics.strongTopics = merged
        }

        // Update dominant topics in preferences
        if (extracted.dominantTopics?.length) {
            const existing = user.preferences.topics || []
            const merged = [...new Set([...existing, ...extracted.dominantTopics.slice(0, 5)])]
            user.preferences.topics = merged
        }

        // Update learning style pref from communication style
        if (extracted.communicationStyle) {
            user.preferences.explanationStyle = extracted.communicationStyle
        }

        await user.save()

        return res.status(200).json({
            message: 'Conversation analyzed successfully.',
            messageCount,
            extracted: {
                summary: extracted.summary,
                dominantTopics: extracted.dominantTopics,
                recurringStruggles: extracted.recurringStruggles,
                estimatedSkillLevel: extracted.estimatedSkillLevel,
                learningPattern: extracted.learningPattern,
            },
        })
    } catch (err) {
        console.error('uploadConversation error:', err)
        res.status(500).json({ error: 'Failed to process uploaded file.' })
    }
}
