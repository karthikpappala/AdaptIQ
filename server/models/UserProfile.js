import mongoose from 'mongoose'

const userProfileSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    profilePic: { type: String, default: null },

    staticProfile: {
        educationLevel: { type: String, default: '' },
        domain: { type: String, default: '' },
        currentRole: { type: String, default: '' },
        industry: { type: String, default: '' },
        preferredLanguage: { type: String, default: 'English' },
        experience: { type: String, default: 'Beginner' },
        age: { type: String, default: '' },
        location: { type: String, default: '' },
        occupation: { type: String, default: '' },
    },

    goals: {
        urgentProblem: { type: String, default: '' },
        improvingAreas: [{ type: String }],
        successVision: { type: String, default: '' },
        targetRole: { type: String, default: '' },
        timeline: { type: String, default: '6 months' },
    },

    competencyMetrics: {
        skillLevel: { type: Number, default: 1, min: 1, max: 5 },
        weakTopics: [{ type: String }],
        strongTopics: [{ type: String }],
        confidenceScore: { type: Number, default: 50, min: 0, max: 100 },
    },

    behaviorMetrics: {
        quizAccuracy: { type: Number, default: 0 },
        engagementScore: { type: Number, default: 50 },
        repeatedQueryCount: { type: Number, default: 0 },
        avgResponseTime: { type: Number, default: 0 },
        totalQuizzesTaken: { type: Number, default: 0 },
        totalInteractions: { type: Number, default: 0 },
    },

    preferences: {
        explanationStyle: { type: String, default: 'Detailed' },
        difficultyPreference: { type: String, default: 'adaptive' },
        responseStyle: { type: String, default: 'Detailed' },
        useCase: { type: String, default: '' },
        topics: [{ type: String }],
        customInstructions: { type: String, default: '' },
    },

    // Short behavioral summary updated periodically (200-300 tokens)
    recentSummary: { type: String, default: '' },

    // Long-term profile from uploaded ChatGPT/Gemini data
    uploadedProfileSummary: { type: String, default: '' },

    // Current difficulty for adaptive quiz/content
    currentDifficulty: { type: String, default: 'medium', enum: ['easy', 'medium', 'hard'] },

    interactionCount: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    assessmentCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
})

// Update lastActive on every save
userProfileSchema.pre('save', function (next) {
    this.lastActive = new Date()
    next()
})

const UserProfile = mongoose.model('UserProfile', userProfileSchema)
export default UserProfile
