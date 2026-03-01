import UserProfile from '../models/UserProfile.js'
import { buildSystemPrompt, buildUserMessage } from '../services/promptBuilderService.js'
import { callLLM, callLLMForJSON } from '../services/llmService.js'
import { updateUserModelBasedOnSignals, buildRecentSummaryText } from '../services/feedbackAnalysisService.js'

// POST /api/chat/message
export async function sendMessage(req, res) {
    try {
        const { userId, message, topic, signals = {} } = req.body

        if (!userId || !message) {
            return res.status(400).json({ error: 'userId and message are required.' })
        }

        const user = await UserProfile.findById(userId)
        if (!user) return res.status(404).json({ error: 'User not found.' })

        // Build adaptive system prompt from user profile
        const systemPrompt = buildSystemPrompt(user, {
            feedbackSignal: signals.lastFeedback,
            comprehensionNote: signals.comprehensionNote,
            quizReview: signals.quizReview || null,
            currentTopic: topic || null,
        })

        const userMessage = buildUserMessage(message, {
            previousTopics: user.preferences?.topics,
        })

        // Call Groq
        const aiResponse = await callLLM(systemPrompt, userMessage, {
            temperature: 0.75,
            maxTokens: 1200,
        })

        const behavioral = signals.behavioral || {}
        const duration = typeof behavioral.sessionDuration === 'number' ? Math.round(behavioral.sessionDuration / 1000) + 's' : (behavioral.sessionDuration || '0s')

        // Log implicit feedback signals to the terminal
        console.log(`\n[Implicit Feedback Recorded for User: ${userId}]`);
        console.log(`Topic: ${topic || 'N/A'}`);
        console.log(`Time Spent (Session Duration): ${duration}`);
        console.log(`Repeated Queries / Revisits: ${behavioral.totalRevisits || 0}`);
        console.log(`Navigation Pattern (Scroll Depth): ${behavioral.scrollMax || 0}%`);
        console.log(`Sections Abandoned: ${behavioral.abandoned || 0}`);
        console.log(`Engagement Delta Applied: +3`);
        console.log(`--------------------------------------------------\n`);

        // Update interaction count and engagement
        await updateUserModelBasedOnSignals(userId, {
            topic,
            isRepeatedQuery: signals.isRepeatedQuery || false,
            engagementDelta: +3,
        })

        // Update recent summary every 5 interactions
        const updatedUser = await UserProfile.findById(userId)
        if (updatedUser.interactionCount % 5 === 0) {
            const newSummary = buildRecentSummaryText(updatedUser)
            updatedUser.recentSummary = newSummary
            await updatedUser.save()
        }

        return res.status(200).json({
            response: aiResponse,
            metrics: {
                skillLevel: updatedUser.competencyMetrics.skillLevel,
                confidenceScore: updatedUser.competencyMetrics.confidenceScore,
                currentDifficulty: updatedUser.currentDifficulty,
            },
        })
    } catch (err) {
        console.error('sendMessage error:', err)
        res.status(500).json({ error: 'Failed to get AI response.' })
    }
}

// POST /api/chat/feedback
export async function submitFeedback(req, res) {
    try {
        const { userId, feedbackSignal, topic, rating } = req.body

        if (!userId || !feedbackSignal) {
            return res.status(400).json({ error: 'userId and feedbackSignal are required.' })
        }

        const updatedUser = await updateUserModelBasedOnSignals(userId, {
            feedbackSignal, // 'too_easy' | 'just_right' | 'too_hard'
            topic,
            engagementDelta: feedbackSignal === 'just_right' ? 5 : -2,
        })

        if (!updatedUser) return res.status(404).json({ error: 'User not found.' })

        return res.status(200).json({
            message: 'Feedback recorded.',
            newDifficulty: updatedUser.currentDifficulty,
            metrics: {
                skillLevel: updatedUser.competencyMetrics.skillLevel,
                confidenceScore: updatedUser.competencyMetrics.confidenceScore,
            },
        })
    } catch (err) {
        console.error('submitFeedback error:', err)
        res.status(500).json({ error: 'Failed to process feedback.' })
    }
}

// POST /api/chat/explain-back
export async function explainBack(req, res) {
    try {
        const { userId, userExplanation, originalTopic } = req.body

        if (!userId || !userExplanation) {
            return res.status(400).json({ error: 'userId and userExplanation are required.' })
        }

        const user = await UserProfile.findById(userId)
        if (!user) return res.status(404).json({ error: 'User not found.' })

        // Assess user's comprehension
        const systemPrompt = `You are an expert tutor assessing a student's understanding.
The student just explained back what they understood about: "${originalTopic || 'the current topic'}".
Assess their comprehension and provide brief, encouraging feedback.
Identify any misconceptions clearly but kindly.
Keep your response under 150 words.`

        const assessment = await callLLM(systemPrompt, `Student's explanation: "${userExplanation}"`, {
            temperature: 0.5,
            maxTokens: 250,
        })

        // Determine comprehension quality for model update
        const qualityCheck = await callLLMForJSON(
            'Assess comprehension quality. Respond with JSON only.',
            `Topic: "${originalTopic}". Student's explanation: "${userExplanation}". Return: {"quality": "good|partial|poor", "hasMisconception": boolean}`
        )

        const { quality } = qualityCheck

        // Update signals based on comprehension
        const engagementDelta = quality === 'good' ? 8 : quality === 'partial' ? 3 : -2
        const feedbackSignal = quality === 'good' ? 'just_right' : quality === 'poor' ? 'too_hard' : null

        console.log(`\n[Implicit Feedback (Explain Back) Recorded for User: ${userId}]`)
        console.log(`Topic: ${originalTopic || 'N/A'}`)
        console.log(`Comprehension Quality: ${quality}`)
        console.log(`Engagement Delta Applied: ${engagementDelta}`)
        console.log(`--------------------------------------------------\n`)

        await updateUserModelBasedOnSignals(userId, {
            feedbackSignal,
            topic: originalTopic,
            engagementDelta,
        })

        return res.status(200).json({
            assessment,
            comprehensionQuality: quality,
            note: 'This assessment will be used to personalize your next response.',
        })
    } catch (err) {
        console.error('explainBack error:', err)
        res.status(500).json({ error: 'Failed to assess comprehension.' })
    }
}

// POST /api/chat/regional
export async function getRegionalExplanation(req, res) {
    try {
        const { userId, lastResponse, targetLanguage } = req.body

        if (!userId || !lastResponse || !targetLanguage) {
            return res.status(400).json({ error: 'userId, lastResponse, and targetLanguage are required.' })
        }

        const user = await UserProfile.findById(userId)
        if (!user) return res.status(404).json({ error: 'User not found.' })

        const systemPrompt = buildSystemPrompt(user, {
            isRegional: true,
            targetLanguage,
        })

        const regionalResponse = await callLLM(
            systemPrompt,
            `Please explain the following in ${targetLanguage}:\n\n${lastResponse}`,
            { temperature: 0.6, maxTokens: 1200 }
        )

        return res.status(200).json({ response: regionalResponse, language: targetLanguage })
    } catch (err) {
        console.error('getRegionalExplanation error:', err)
        res.status(500).json({ error: 'Failed to translate response.' })
    }
}
