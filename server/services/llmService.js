import Groq from 'groq-sdk'

const MODEL = 'llama-3.3-70b-versatile'

// Lazy client — instantiated on first use so dotenv has already loaded
let _groq = null
function getGroq() {
    if (!_groq) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing. Add it to server/.env')
        }
        _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    }
    return _groq
}

/**
 * Core LLM call — single system + user message
 */
export async function callLLM(systemPrompt, userMessage, options = {}) {
    const { temperature = 0.7, maxTokens = 1024 } = options

    const response = await getGroq().chat.completions.create({
        model: MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
        ],
        temperature,
        max_tokens: maxTokens,
    })

    return response.choices[0]?.message?.content?.trim() || ''
}

/**
 * Streaming LLM call — returns async iterable chunks
 */
export async function callLLMStream(systemPrompt, userMessage, options = {}) {
    const { temperature = 0.7, maxTokens = 1024 } = options

    const stream = await getGroq().chat.completions.create({
        model: MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true,
    })

    return stream
}

/**
 * Structured JSON extraction from LLM
 */
export async function callLLMForJSON(systemPrompt, userMessage) {
    const result = await callLLM(
        systemPrompt + '\n\nRespond ONLY with valid JSON. No markdown, no prose.',
        userMessage,
        { temperature: 0.3, maxTokens: 1500 }
    )

    // Strip markdown code fences if present
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
}
