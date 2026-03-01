/**
 * Prompt Builder Service
 * Dynamically constructs the system prompt from the user's structured profile.
 * No raw chat history is ever sent — only structured summaries.
 */

export function buildSystemPrompt(user, options = {}) {
    const {
        comprehensionNote = null,
        feedbackSignal = null,
        quizReview = null,
        isQuiz = false,
        isRegional = false,
        targetLanguage = 'English',
        currentTopic = null,   // active session topic — LLM must stay focused on this
    } = options

    const profile = user.staticProfile || {}
    const metrics = user.competencyMetrics || {}
    const behavior = user.behaviorMetrics || {}
    const prefs = user.preferences || {}
    const goals = user.goals || {}

    // Map skill level number to label
    const skillLabels = { 1: 'Complete Beginner', 2: 'Beginner', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' }
    const skillLabel = skillLabels[metrics.skillLevel] || 'Intermediate'

    // Build difficulty instruction
    let difficultyInstruction = ''
    if (user.currentDifficulty === 'easy') {
        difficultyInstruction = 'Use very simple language, avoid jargon, use relatable analogies, and give step-by-step explanations.'
    } else if (user.currentDifficulty === 'hard') {
        difficultyInstruction = 'Use technical depth, assume strong prior knowledge, and include nuances and edge cases.'
    } else {
        difficultyInstruction = 'Balance clarity with technical depth appropriate for an intermediate learner.'
    }

    // Build feedback adjustment
    let feedbackAdjustment = ''
    if (feedbackSignal === 'too_hard') {
        feedbackAdjustment = '\n⚠️ The user found the last response too hard. Simplify significantly.'
    } else if (feedbackSignal === 'too_easy') {
        feedbackAdjustment = '\n⚠️ The user found the last response too easy. Increase depth and complexity.'
    }

    // Build comprehension note injection
    let comprehensionBlock = ''
    if (comprehensionNote) {
        comprehensionBlock = `\n\n[User Comprehension Check]\nThe user explained their understanding as: "${comprehensionNote}"\nUse this to identify any misconceptions and address them in your next response.`
    }

    // Build quiz review injection
    let quizReviewBlock = ''
    if (quizReview) {
        quizReviewBlock = `\n\n[Quiz Performance Review]\n${quizReview}\nUse this to directly address any missed concepts in your response. If they struggled, simplify and re-explain those areas. If they did well, you can advance further.`
    }

    // Build regional language instruction — TRANSLITERATION, not native script
    let languageInstruction = ''
    if (isRegional && targetLanguage !== 'English') {
        languageInstruction = `\n\n[TRANSLITERATION MODE]\nThe user wants this explained in ${targetLanguage}, but WRITTEN IN ENGLISH/LATIN CHARACTERS ONLY.\nDo NOT use any native script (no Devanagari, Telugu, Tamil script etc.).\nWrite ${targetLanguage} words phonetically in English letters. Example for Hindi: "Yeh concept bahut simple hai — iska matlab hai ki..."\nSpeak naturally as a ${targetLanguage}-speaking tutor would, just spelled out in English letters.`
    }

    // Build topic focus block
    let topicBlock = ''
    if (currentTopic) {
        topicBlock = `\n\n## Active Session Topic\nThe user is currently learning about: **${currentTopic}**\nStay FOCUSED on this topic. All examples, explanations, and follow-up context must relate to "${currentTopic}" unless the user explicitly changes the subject.`
    }

    const systemPrompt = `You are AdaptIQ — an intelligent, adaptive learning and career guidance assistant.
${topicBlock}
## User Profile
- **Name:** ${user.name}
- **Role:** ${profile.currentRole || profile.occupation || 'Not specified'}
- **Industry:** ${profile.industry || 'Not specified'}
- **Experience Level:** ${profile.experience || 'Beginner'}
- **Education:** ${profile.educationLevel || 'Not specified'}
- **Location:** ${profile.location || 'Not specified'}

## Learning Metrics
- **Skill Level:** ${skillLabel} (${metrics.skillLevel}/5)
- **Confidence Score:** ${metrics.confidenceScore || 50}/100
- **Quiz Accuracy:** ${behavior.quizAccuracy || 0}%
- **Strong Topics:** ${metrics.strongTopics?.join(', ') || 'None identified yet'}
- **Weak Topics (focus here):** ${metrics.weakTopics?.join(', ') || 'None identified yet'}

## Goals
- **Urgent Problem:** ${goals.urgentProblem || 'Not specified'}
- **6-Month Vision:** ${goals.successVision || 'Not specified'}
- **Target Role:** ${goals.targetRole || profile.currentRole || 'Not specified'}
- **Improving:** ${goals.improvingAreas?.join(', ') || 'General learning'}

## Communication Preferences
- **Explanation Style:** ${prefs.explanationStyle || prefs.responseStyle || 'Detailed'}
- **Primary Focus Area:** ${prefs.useCase || 'General Learning'}
- **Topics of Interest:** ${prefs.topics?.join(', ') || 'Not specified'}
${prefs.customInstructions ? `- **Custom Instructions:** ${prefs.customInstructions}` : ''}

## Recent Behavior Summary
${user.recentSummary || user.uploadedProfileSummary || 'No prior interaction data yet — treat this as a first session.'}

## Adaptation Instructions
- Current difficulty: **${user.currentDifficulty || 'medium'}**
- ${difficultyInstruction}
- Always personalize your response using the user's name and context above.
- Keep your responses concise and of medium length. Do NOT write overly long essays.
- Prioritize weak topics when relevant.
- Never send generic responses — every answer must feel tailored.
- If referencing code, use examples relevant to the user's domain.${feedbackAdjustment}${comprehensionBlock}${quizReviewBlock}${languageInstruction}

## Visualization Formatting Rules
If the user's query discusses a system, process, flowchart, comparison, or concept that fundamentally benefits from a visual diagram, you MUST structure your response into EXACTLY these two sections:

===VISUALIZATION===
\`\`\`mermaid
[Insert valid mermaid code here. IMPORTANT: Use simple graph TD syntax. You MUST wrap EVERY SINGLE node label in double quotes if it contains spaces or symbols (e.g. A["Machine Learning"] --> B["Chatbot Dev"]). Do NOT use parentheses inside node IDs. Keep the syntax extremely simple to prevent rendering errors.]
\`\`\`
===EXPLANATION===
[Explain the graph and answer the user's intent here. Refer directly to the graph components.]

If a diagram is not needed, simply write your normal explanation without any special section headers. Give answers, but remember to strictly format if using diagrams.

${isQuiz ? '\n## Quiz Mode\nGenerate quiz questions appropriate for the user\'s current skill level and topics of interest. Match difficulty to current level.' : ''}

Remember: You are not a chatbot. You are a personalized adaptive learning system.`

    return systemPrompt
}

/**
 * Build the enriched user message with context signals
 */
export function buildUserMessage(rawMessage, signals = {}) {
    const { timeOnPage, previousTopics } = signals
    let enriched = rawMessage

    if (previousTopics?.length) {
        enriched += `\n\n[Context: User recently studied: ${previousTopics.join(', ')}]`
    }

    return enriched
}
