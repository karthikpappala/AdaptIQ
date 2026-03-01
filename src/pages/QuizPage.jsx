import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { quizApi } from '../api/client'
import ThemeToggle from '../components/ui/ThemeToggle'
import Icon from '../components/ui/Icon'

export default function QuizPage() {
    const { user, refreshUser } = useUser()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const location = useLocation()
    const chatContext = location.state?.context

    const [phase, setPhase] = useState('setup') // setup | quiz | results
    const [topic, setTopic] = useState(location.state?.topic || searchParams.get('topic') || '')
    const [loading, setLoading] = useState(false)
    const [quiz, setQuiz] = useState(null)
    const [answers, setAnswers] = useState({}) // Changed to object
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    const hasAutoStarted = useRef(false)

    useEffect(() => {
        if (!user) {
            navigate('/')
        } else if ((searchParams.get('topic') || chatContext) && !hasAutoStarted.current) {
            hasAutoStarted.current = true
            startQuiz(location.state?.topic || searchParams.get('topic'))
        }
    }, [user, searchParams, chatContext])

    const startQuiz = async (selectedTopic) => {
        const t = selectedTopic || topic
        if (!t) { setError('Please specify a topic'); return }
        setLoading(true); setError('')
        try {
            let data;
            if (chatContext) {
                data = await quizApi.generateFromContext(user._id, chatContext)
            } else {
                data = await quizApi.generateQuiz(user._id, t)
            }

            // Backend returns { quiz: { questions: [...] } }
            setQuiz(data.quiz.questions)
            setTopic(data.quiz.topic || t)
            setAnswers({})
            setPhase('quiz')
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    const handleAnswer = (qId, answer) => {
        setAnswers(prev => ({ ...prev, [qId]: answer }))
    }

    const submitQuiz = async () => {
        if (Object.keys(answers).length < quiz.length) {
            setError('Please answer all questions before submitting.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const data = await quizApi.submitQuiz(user._id, topic, answers, quiz)
            setResult(data)
            setPhase('results')
            refreshUser()
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    if (!user) return null

    return (
        <div style={{ minHeight: '100vh', background: 'var(--t-bg)', padding: 'clamp(12px,3vw,32px)' }}>
            <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}><ThemeToggle /></div>

            <div style={{ maxWidth: 680, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <button onClick={() => navigate('/dashboard')} style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--t-surface)', border: '1px solid var(--t-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-text-2)', cursor: 'pointer' }}>
                        <Icon name="arrow-left" size={14} />
                    </button>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 700, color: 'var(--t-text)' }}>
                            Adaptive Assessment
                        </h1>
                        <p style={{ color: 'var(--t-text-2)', fontSize: '0.78rem' }}>Difficulty level: <span style={{ color: 'var(--t-accent)', fontWeight: 600 }}>{user.currentDifficulty}</span></p>
                    </div>
                </div>

                {/* Phase: Setup */}
                {phase === 'setup' && (
                    <div className="animate-fade-slide">
                        <div className="glass-card" style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-accent)' }}>
                                    <Icon name="zap" size={18} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--t-text)' }}>Skill Calibration</div>
                                    <div style={{ fontSize: '0.73rem', color: 'var(--t-text-3)' }}>Quizzes help AdaptIQ find your exact boundary of knowledge</div>
                                </div>
                            </div>

                            <label className="field-label">Topic to Test</label>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                                <input
                                    className="t-input"
                                    placeholder="e.g. React Hooks, Medical Ethics, Marketing Fundamentals"
                                    value={topic}
                                    onChange={e => { setTopic(e.target.value); setError('') }}
                                />
                                <button onClick={() => startQuiz()} disabled={loading || !topic.trim()} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                                    {loading ? 'Preparing...' : 'Start Quiz'}
                                    {!loading && <Icon name="arrow" size={15} />}
                                </button>
                            </div>

                            {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--t-danger-bg)', border: '1px solid var(--t-danger-bd)', color: 'var(--t-danger-tx)', fontSize: '0.82rem', marginBottom: 20 }}>{error}</div>}

                            {(user.competencyMetrics?.weakTopics || []).length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--t-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Focus on improvements</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {user.competencyMetrics.weakTopics.map(t => (
                                            <button key={t} onClick={() => startQuiz(t)} disabled={loading}
                                                style={{ padding: '7px 14px', borderRadius: 9999, border: '1.5px solid var(--t-danger-bd)', background: 'var(--t-danger-bg)', color: 'var(--t-danger-tx)', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Icon name="refresh" size={12} /> {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 12, background: 'var(--t-accent-bg-2)', border: '1px solid var(--t-border)' }}>
                            <Icon name="info" size={16} style={{ color: 'var(--t-accent)', flexShrink: 0, marginTop: 1 }} />
                            <p style={{ fontSize: '0.78rem', color: 'var(--t-text-2)', lineHeight: 1.5, margin: 0 }}>
                                AdaptIQ generates questions specific to your current skill level. If you struggle, the next quiz will be easier. If you breeze through, we'll ramp up the depth.
                            </p>
                        </div>
                    </div>
                )}

                {/* Phase: Quiz Content */}
                {phase === 'quiz' && quiz && (
                    <div className="animate-fade-slide">
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--t-accent)' }}>Assessment on</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--t-text-3)' }}>{topic}</span>
                            </div>
                        </div>

                        {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--t-danger-bg)', border: '1px solid var(--t-danger-bd)', color: 'var(--t-danger-tx)', fontSize: '0.82rem', marginBottom: 20 }}>{error}</div>}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 20 }}>
                            {quiz.map((q, qIdx) => (
                                <div key={q.id} className="glass-card">
                                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--t-text)', lineHeight: 1.5, marginBottom: 24 }}>
                                        <span style={{ opacity: 0.5, marginRight: 8 }}>{qIdx + 1}.</span>{q.question}
                                    </h2>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                                        {q.options.map((opt, i) => {
                                            const isSelected = answers[q.id] === opt
                                            return (
                                                <button key={i} onClick={() => handleAnswer(q.id, opt)} disabled={loading}
                                                    style={{
                                                        padding: '16px 20px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                                                        background: isSelected ? 'var(--t-accent-bg)' : 'var(--t-input-bg)',
                                                        border: `1.5px solid ${isSelected ? 'var(--t-accent)' : 'var(--t-border-2)'}`,
                                                        color: isSelected ? 'var(--t-accent)' : 'var(--t-text)',
                                                        fontSize: '0.92rem', transition: 'all 0.15s',
                                                    }}
                                                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--t-accent)'; e.currentTarget.style.background = 'var(--t-accent-bg-2)' } }}
                                                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--t-border-2)'; e.currentTarget.style.background = 'var(--t-input-bg)' } }}
                                                >
                                                    <span style={{ marginRight: 12, opacity: isSelected ? 0.8 : 0.4, fontWeight: 700 }}>0{i + 1}</span>
                                                    {opt}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            <button onClick={submitQuiz} disabled={loading} className="btn-primary" style={{ marginTop: 12, padding: '16px', fontSize: '1.05rem' }}>
                                {loading ? 'Submitting...' : 'Submit Answers'}
                                {!loading && <Icon name="check" size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Phase: Results */}
                {phase === 'results' && result && (
                    <div className="animate-fade-slide">
                        <div className="glass-card" style={{ textAlign: 'center', marginBottom: 16 }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--t-accent-bg)', border: '2px solid var(--t-border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--t-accent)' }}>
                                <Icon name="check" size={32} />
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--t-text)', marginBottom: 4 }}>
                                Assessment Complete
                            </h2>
                            <p style={{ color: 'var(--t-text-2)', fontSize: '0.88rem', marginBottom: 24 }}>
                                You scored <span style={{ color: 'var(--t-accent)', fontWeight: 700 }}>{result.score} / {result.total}</span>
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                                <div style={{ padding: '14px', borderRadius: 12, background: 'var(--t-surface-2)', border: '1px solid var(--t-border)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--t-text-3)', textTransform: 'uppercase', marginBottom: 3 }}>Accuracy</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--t-text)' }}>{result.accuracy}%</div>
                                </div>
                                <div style={{ padding: '14px', borderRadius: 12, background: 'var(--t-surface-2)', border: '1px solid var(--t-border)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--t-text-3)', textTransform: 'uppercase', marginBottom: 3 }}>Difficulty shift</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: result.difficultyChange === 'increased' ? 'var(--t-success-tx)' : result.difficultyChange === 'decreased' ? 'var(--t-danger-tx)' : 'var(--t-accent)' }}>
                                        {result.difficultyChange === 'none' ? 'Stable' : result.difficultyChange}
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setPhase('setup')} className="btn-primary" style={{ width: '100%', marginBottom: 10 }}>
                                Try Another Topic
                            </button>
                            <button onClick={() => navigate('/chat')} className="btn-ghost" style={{ width: '100%' }}>
                                Discuss Results in Chat
                            </button>
                        </div>

                        {/* Explanations */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--t-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Detailed Review</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {result.insights?.map((insight, idx) => (
                                    <div key={idx} style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <div style={{ width: 14, height: 14, borderRadius: '50%', background: insight.isCorrect ? 'var(--t-success-tx)' : 'var(--t-danger-tx)' }} />
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--t-text)' }}>Question {idx + 1}</div>
                                        </div>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--t-text-2)', lineHeight: 1.5, margin: 0 }}>{insight.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
