import { callLLMForJSON } from './llmService.js'

/**
 * Parses user-uploaded ChatGPT or Gemini JSON export.
 * Extracts ONLY from user messages — ignores AI responses.
 * Returns a structured summary stored in the user profile.
 * This runs ONCE on upload, not on every chat request.
 */
export async function parseUploadedConversation(rawJson) {
    let userMessages = []

    // --- Parse ChatGPT format ---
    // ChatGPT exports as array of conversations, each with a "mapping" object
    if (Array.isArray(rawJson)) {
        for (const conversation of rawJson) {
            if (conversation.mapping) {
                // ChatGPT format
                const messages = Object.values(conversation.mapping)
                    .filter(node => node?.message?.author?.role === 'user')
                    .map(node => node?.message?.content?.parts?.join(' ') || '')
                    .filter(Boolean)
                userMessages.push(...messages)
            } else if (conversation.parts) {
                // Simple array format
                userMessages.push(...conversation.parts)
            } else if (conversation.header === 'Gemini Apps' && conversation.title) {
                // Google Takeout Gemini format (MyActivity.json)
                let text = conversation.title;
                if (text.startsWith('Prompted ')) {
                    text = text.substring(9);
                }
                if (text.trim()) {
                    userMessages.push(text);
                }
            }
        }
    }

    // --- Parse Gemini format ---
    // Gemini exports as { conversations: [{ messages: [{ author, content }] }] }
    if (rawJson.conversations && Array.isArray(rawJson.conversations)) {
        for (const convo of rawJson.conversations) {
            const msgs = (convo.messages || [])
                .filter(m => m.author === 'user' || m.role === 'user')
                .map(m => m.content || m.text || '')
                .filter(Boolean)
            userMessages.push(...msgs)
        }
    }

    // Also handle flat message array
    if (rawJson.messages && Array.isArray(rawJson.messages)) {
        const msgs = rawJson.messages
            .filter(m => m.author === 'user' || m.role === 'user')
            .map(m => m.content || m.text || '')
            .filter(Boolean)
        userMessages.push(...msgs)
    }

    if (userMessages.length === 0) {
        return {
            success: false,
            error: 'No user messages found in the uploaded file.',
            summary: null,
        }
    }

    // Chunk messages to fit context (take last 100 messages, ~3000 words)
    const recentMessages = userMessages.slice(-100).join('\n---\n')
    const preview = recentMessages.slice(0, 8000) // Limit to ~8000 chars

    const systemPrompt = `You are an analyst extracting a structured learning profile from a user's past AI conversation messages.
Analyze ONLY what the user wrote (not AI responses).
CRITICAL: Ignore personal chats, casual conversations, jokes, timepass, or prompts related to image generation. Focus strictly on topics relevant to study, work, coding, technical concepts, or professional learning. Extract patterns about their knowledge, struggles, and learning style.`

    const userPrompt = `Here are the user's messages from past AI conversations:

${preview}

Extract a JSON object with these fields:
{
  "dominantTopics": ["list of main topics they asked about"],
  "recurringStruggles": ["concepts they repeatedly asked about or seemed confused by"],
  "strongTopics": ["topics where they show high proficiency or deep understanding"],
  "communicationStyle": "one of: concise, detailed, exploratory, practical",
  "confidenceIndicators": "brief note on how confident they seem (e.g. asks basic questions, uses technical vocabulary, etc.)",
  "estimatedSkillLevel": "one of: Beginner, Intermediate, Advanced",
  "learningPattern": "brief description of how they learn (e.g. project-based, concept-first, example-driven)",
  "summary": "2-3 sentence behavioral summary for use in system prompts"
}`

    try {
        const extracted = await callLLMForJSON(systemPrompt, userPrompt)
        return { success: true, extracted, messageCount: userMessages.length }
    } catch (err) {
        return {
            success: false,
            error: 'Failed to parse conversation data: ' + err.message,
            summary: null,
        }
    }
}
