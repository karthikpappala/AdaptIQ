import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
})

// Request interceptor — attach userId if available
api.interceptors.request.use((config) => {
    const userId = localStorage.getItem('adaptiq_userId')
    if (userId && !config.headers['X-User-Id']) {
        config.headers['X-User-Id'] = userId
    }
    return config
})

// Response interceptor — normalize errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || error.message || 'Something went wrong.'
        return Promise.reject(new Error(message))
    }
)

// --- User APIs ---
export const userApi = {
    register: (data) => api.post('/users/register', data),
    getById: (id) => api.get(`/users/${id}`),
    getByEmail: (email) => api.get(`/users/email/${email}`),
    updateAssessment: (id, data) => api.put(`/users/${id}/assessment`, data),
    updateSummary: (id, summary) => api.put(`/users/${id}/profile-summary`, { recentSummary: summary }),
    deleteAccount: (id) => api.delete(`/users/${id}`),
}

// --- Chat APIs ---
export const chatApi = {
    sendMessage: (data) => api.post('/chat/message', data),
    submitFeedback: (data) => api.post('/chat/feedback', data),
    explainBack: (data) => api.post('/chat/explain-back', data),
    getRegional: (data) => api.post('/chat/regional', data),
}

// --- Quiz APIs ---
export const quizApi = {
    generateQuiz: (userId, topic) => api.get(`/quiz/generate`, { params: { userId, topic } }),
    generateFromContext: (userId, context) => api.post('/quiz/generate-from-context', { userId, context }),
    submitQuiz: (userId, topic, answers, questions) => api.post('/quiz/submit', { userId, topic, answers, questions }),
}

// --- Career APIs ---
export const careerApi = {
    getGap: (userId) => api.get(`/career/gap`, { params: { userId } }),
    updateTargetRole: (userId, targetRole) => api.put('/career/target-role', { userId, targetRole }),
    listRoles: () => api.get('/career/roles'),
}

// --- Upload API ---
export const uploadApi = {
    parseConversation: (userId, file) => {
        const formData = new FormData()
        formData.append('userId', userId)
        formData.append('file', file)
        return api.post('/upload/parse', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
}

export default api
