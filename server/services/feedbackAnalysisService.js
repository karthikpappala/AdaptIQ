import UserProfile from '../models/UserProfile.js'

/**
 * Updates the user model based on explicit + implicit feedback signals.
 * Called after every interaction and quiz submission.
 */
export async function updateUserModelBasedOnSignals(userId, signals) {
    const {
        feedbackSignal,      // 'too_easy' | 'just_right' | 'too_hard'
        quizAccuracy,        // 0-100, only for quiz submissions
        topic,               // topic of the interaction
        isRepeatedQuery,     // boolean
        engagementDelta,     // +/- number to add to engagement score
    } = signals

    const user = await UserProfile.findById(userId)
    if (!user) return null

    const metrics = user.competencyMetrics
    const behavior = user.behaviorMetrics

    // --- Skill level adjustment ---
    if (feedbackSignal === 'too_easy' && metrics.skillLevel < 5) {
        metrics.skillLevel = Math.min(5, metrics.skillLevel + 0.5)
        metrics.confidenceScore = Math.min(100, metrics.confidenceScore + 5)
        // Move topic to strong if present in weak
        if (topic && metrics.weakTopics.includes(topic)) {
            metrics.weakTopics = metrics.weakTopics.filter(t => t !== topic)
            if (!metrics.strongTopics.includes(topic)) metrics.strongTopics.push(topic)
        }
    } else if (feedbackSignal === 'too_hard') {
        metrics.skillLevel = Math.max(1, metrics.skillLevel - 0.25)
        metrics.confidenceScore = Math.max(0, metrics.confidenceScore - 5)
        // Add topic to weak if not already there
        if (topic && !metrics.weakTopics.includes(topic)) {
            metrics.weakTopics.push(topic)
        }
    }

    // --- Difficulty level adjustment ---
    if (feedbackSignal === 'too_easy') {
        user.currentDifficulty = user.currentDifficulty === 'easy' ? 'medium' : 'hard'
    } else if (feedbackSignal === 'too_hard') {
        user.currentDifficulty = user.currentDifficulty === 'hard' ? 'medium' : 'easy'
    }

    // --- Quiz accuracy update ---
    if (quizAccuracy !== undefined) {
        const prevTotal = behavior.totalQuizzesTaken || 0
        const prevAcc = behavior.quizAccuracy || 0
        behavior.totalQuizzesTaken = prevTotal + 1
        // Rolling average
        behavior.quizAccuracy = Math.round((prevAcc * prevTotal + quizAccuracy) / (prevTotal + 1))

        // Adjust skill based on quiz performance
        if (quizAccuracy >= 80) {
            metrics.skillLevel = Math.min(5, metrics.skillLevel + 0.25)
            metrics.confidenceScore = Math.min(100, metrics.confidenceScore + 8)
        } else if (quizAccuracy < 50) {
            metrics.skillLevel = Math.max(1, metrics.skillLevel - 0.25)
            metrics.confidenceScore = Math.max(0, metrics.confidenceScore - 5)
            if (topic && !metrics.weakTopics.includes(topic)) metrics.weakTopics.push(topic)
        }
    }

    // --- Engagement score update ---
    if (engagementDelta !== undefined) {
        behavior.engagementScore = Math.min(100, Math.max(0, behavior.engagementScore + engagementDelta))
    }

    // --- Repeated query tracking ---
    if (isRepeatedQuery) {
        behavior.repeatedQueryCount = (behavior.repeatedQueryCount || 0) + 1
        // If repeating a lot → topic is weak
        if (behavior.repeatedQueryCount % 3 === 0 && topic && !metrics.weakTopics.includes(topic)) {
            metrics.weakTopics.push(topic)
        }
    }

    // --- Interaction count ---
    user.interactionCount = (user.interactionCount || 0) + 1
    user.behaviorMetrics.totalInteractions = user.interactionCount

    // Round skill level to 1 decimal
    metrics.skillLevel = Math.round(metrics.skillLevel * 10) / 10

    user.competencyMetrics = metrics
    user.behaviorMetrics = behavior
    await user.save()

    // Log the resulting changes to the terminal
    console.log(`[Metrics Updated for User: ${userId}]`)
    console.log(`New Skill Level: ${metrics.skillLevel}`)
    console.log(`New Engagement Score: ${behavior.engagementScore}`)
    console.log(`New Repeated Query Count: ${behavior.repeatedQueryCount || 0}`)
    console.log(`--------------------------------------------------\n`)

    return user
}

/**
 * Regenerate the recent summary for the user profile.
 * Called after every N interactions or by a scheduled update.
 * Summarizes recent behavioral patterns into a short text block.
 */
export function buildRecentSummaryText(user) {
    const metrics = user.competencyMetrics
    const behavior = user.behaviorMetrics
    const goals = user.goals

    const parts = []

    if (metrics.weakTopics?.length) {
        parts.push(`Recently struggling with: ${metrics.weakTopics.slice(0, 3).join(', ')}.`)
    }
    if (metrics.strongTopics?.length) {
        parts.push(`Demonstrating strength in: ${metrics.strongTopics.slice(0, 3).join(', ')}.`)
    }
    if (behavior.quizAccuracy) {
        parts.push(`Quiz accuracy stands at ${behavior.quizAccuracy}%.`)
    }
    if (metrics.confidenceScore < 40) {
        parts.push('User confidence is low — needs encouragement and simpler explanations.')
    } else if (metrics.confidenceScore > 75) {
        parts.push('User is showing high confidence — can handle more advanced material.')
    }
    if (behavior.repeatedQueryCount > 2) {
        parts.push(`Has asked repeated clarification questions — may need different explanation approach.`)
    }
    if (goals.urgentProblem) {
        parts.push(`Primary concern: ${goals.urgentProblem}.`)
    }

    return parts.join(' ') || 'No significant behavioral patterns yet — early stage learning session.'
}
