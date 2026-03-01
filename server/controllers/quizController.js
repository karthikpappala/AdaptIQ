import UserProfile from '../models/UserProfile.js'
import { buildSystemPrompt } from '../services/promptBuilderService.js'
import { callLLMForJSON } from '../services/llmService.js'
import { updateUserModelBasedOnSignals } from '../services/feedbackAnalysisService.js'

// GET /api/quiz/generate?userId=...&topic=...
export async function generateQuiz(req, res) {
    try {
        const { userId, topic } = req.query

        if (!userId) return res.status(400).json({ error: 'userId is required.' })

        const user = await UserProfile.findById(userId)
        if (!user) return res.status(404).json({ error: 'User not found.' })

        const systemPrompt = buildSystemPrompt(user, { isQuiz: true })

        const difficulty = user.currentDifficulty || 'medium'
        const skillLevel = user.competencyMetrics?.skillLevel || 2
        const interestTopics = user.preferences?.topics?.join(', ') || 'General Knowledge'
        const targetTopic = topic || interestTopics

        const quizPrompt = `Generate a 5-question multiple choice quiz on: ${targetTopic}
Difficulty: ${difficulty} (Skill level ${skillLevel}/5)

Return ONLY this JSON structure:
{
  "topic": "string",
  "difficulty": "easy|medium|hard",
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}`

        const quiz = await callLLMForJSON(systemPrompt, quizPrompt)

        return res.status(200).json({ quiz })
    } catch (err) {
        console.error('generateQuiz error:', err)
        res.status(500).json({ error: 'Failed to generate quiz.' })
    }
}

// POST /api/quiz/generateFromContext
export async function generateFromContext(req, res) {
    try {
        const { userId, context } = req.body

        if (!userId) return res.status(400).json({ error: 'userId is required.' })
        if (!context) return res.status(400).json({ error: 'context is required.' })

        const user = await UserProfile.findById(userId)
        if (!user) return res.status(404).json({ error: 'User not found.' })

        const systemPrompt = buildSystemPrompt(user, { isQuiz: true })

        const difficulty = user.currentDifficulty || 'medium'
        const skillLevel = user.competencyMetrics?.skillLevel || 2

        // Trim to avoid overly long prompts
        const ctx = context.slice(0, 1500)

        const quizPrompt = `You are an adaptive assessment engine. A student just read this explanation:
"""
${ctx}
"""

Their skill level: ${skillLevel}/5, difficulty: ${difficulty}.

Generate exactly 5 multiple-choice questions that ASSESS different ASPECTS of the student's understanding:
- Q1: factual recall of a key definition or concept
- Q2: applied understanding (how/why it works)
- Q3: edge-case or exception scenario
- Q4: comparison or contrast with a related concept
- Q5: implication or consequence of the concept

All questions must be directly grounded in the text above. First infer the topic from the content.

Return ONLY valid JSON (no markdown fences, no extra text):
{
  "topic": "inferred topic name",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "1-sentence explanation"
    }
  ]
}`

        const quiz = await callLLMForJSON(systemPrompt, quizPrompt)

        return res.status(200).json({ quiz })
    } catch (err) {
        console.error('generateFromContext error:', err)
        res.status(500).json({ error: 'Failed to generate quiz from context.' })
    }
}

// POST /api/quiz/submit
export async function submitQuiz(req, res) {
    try {
        const { userId, answers, questions, topic } = req.body
        // answers: { questionId: "A" }
        // questions: [{ id, correctAnswer, question }]

        if (!userId || !answers || !questions) {
            return res.status(400).json({ error: 'userId, answers, and questions are required.' })
        }

        // Compute accuracy
        let correct = 0
        const results = questions.map(q => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer?.charAt(0) === q.correctAnswer?.charAt(0)
            if (isCorrect) correct++
            return {
                questionId: q.id,
                question: q.question,
                userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
                explanation: q.explanation,
            }
        })

        const accuracy = Math.round((correct / questions.length) * 100)

        // Update user model
        const updatedUser = await updateUserModelBasedOnSignals(userId, {
            quizAccuracy: accuracy,
            topic,
            engagementDelta: accuracy >= 70 ? 10 : -5,
        })

        const feedbackMessage = accuracy >= 80
            ? '🎉 Excellent! Difficulty increasing.'
            : accuracy >= 50
                ? '👍 Good effort! Keep practicing.'
                : '💪 Keep going! Difficulty reduced to help you improve.'

        // Build a natural-language signal to inject into the next chat prompt
        const missedConcepts = results.filter(r => !r.isCorrect).map(r => r.question)
        const quizSignal = accuracy >= 80
            ? `The student just scored ${accuracy}% on a quiz about "${topic || 'the topic'}". They demonstrated strong understanding.`
            : accuracy >= 50
                ? `The student just scored ${accuracy}% on a quiz about "${topic || 'the topic'}". They had partial understanding. They struggled with: ${missedConcepts.join(' | ')}`
                : `The student just scored ${accuracy}% on a quiz about "${topic || 'the topic'}". They need extra support. Missed concepts: ${missedConcepts.join(' | ')}`

        return res.status(200).json({
            accuracy,
            correct,
            total: questions.length,
            results,
            feedback: feedbackMessage,
            newDifficulty: updatedUser?.currentDifficulty,
            metrics: {
                skillLevel: updatedUser?.competencyMetrics?.skillLevel,
                confidenceScore: updatedUser?.competencyMetrics?.confidenceScore,
            },
            quizSignal, // New field for the quiz summary
        })
    } catch (err) {
        console.error('submitQuiz error:', err)
        res.status(500).json({ error: 'Failed to submit quiz.' })
    }
}
