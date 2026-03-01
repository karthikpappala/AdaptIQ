import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { chatApi } from '../api/client'
import ThemeToggle from '../components/ui/ThemeToggle'
import Icon from '../components/ui/Icon'
import MermaidGraph from '../components/ui/MermaidGraph'

const REGIONAL_LANGUAGES = ['Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Punjabi']

const btn = (active, activeStyle = {}) => ({
    padding: '5px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s', border: '1px solid var(--t-border-2)',
    background: active ? 'var(--t-accent-bg)' : 'var(--t-input-bg)',
    color: active ? 'var(--t-accent)' : 'var(--t-text-3)',
    ...activeStyle,
})

const renderAIResponse = (content) => {
    if (content.includes('===VISUALIZATION===') && content.includes('===EXPLANATION===')) {
        try {
            const parts = content.split('===VISUALIZATION===')
            const preText = parts[0].trim()
            const mainParts = parts[1].split('===EXPLANATION===')

            let mermaidCode = mainParts[0].trim()
            mermaidCode = mermaidCode.replace(/```[a-z]*/ig, '').replace(/```/g, '').trim()

            const explanationText = mainParts[1].trim()

            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {preText && (
                        <pre style={{ fontSize: '0.9rem', color: 'var(--t-text)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: 0 }}>
                            {preText}
                        </pre>
                    )}
                    <MermaidGraph chart={mermaidCode} />
                    <pre style={{ fontSize: '0.9rem', color: 'var(--t-text)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: 0 }}>
                        {explanationText}
                    </pre>
                </div>
            )
        } catch (err) {
            console.error('Failed to parse visualization block', err)
        }
    }

    return (
        <pre style={{ fontSize: '0.9rem', color: 'var(--t-text)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: 0 }}>
            {content}
        </pre>
    )
}

export default function ChatPage() {
    const { user, refreshUser } = useUser()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const bottomRef = useRef(null)

    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [topic, setTopic] = useState(params.get('topic') || '')
    const [loading, setLoading] = useState(false)

    // Explain Back modal
    const [xbModal, setXbModal] = useState({ open: false, msgIdx: null })
    const [xbText, setXbText] = useState('')
    const [xbLoading, setXbLoading] = useState(false)
    const [xbResult, setXbResult] = useState(null)

    // Regional modal
    const [rgModal, setRgModal] = useState({ open: false, msgIdx: null })
    const [rgLang, setRgLang] = useState(user?.staticProfile?.preferredLanguage || 'Hindi')
    const [rgLoading, setRgLoading] = useState(false)
    const [rgResult, setRgResult] = useState(null)

    const lastFeedback = useRef(null)
    const lastXB = useRef(null)

    useEffect(() => { if (!user) navigate('/') }, [user])
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

    const sendMessage = async () => {
        if (!input.trim() || loading) return
        const userMsg = { role: 'user', content: input.trim() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)
        try {
            const behavioralData = JSON.parse(localStorage.getItem('behavioralSignals') || '{}')
            const data = await chatApi.sendMessage({
                userId: user._id, message: input.trim(), topic,
                signals: {
                    lastFeedback: lastFeedback.current,
                    comprehensionNote: lastXB.current,
                    behavioral: behavioralData
                },
            })
            lastFeedback.current = null
            lastXB.current = null
            setMessages(prev => [...prev, { role: 'ai', content: data.response }])
            refreshUser()
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: `Error: ${err.message}`, isError: true }])
        } finally { setLoading(false) }
    }

    const submitFeedback = async (msgIdx, signal) => {
        lastFeedback.current = signal
        setMessages(prev => prev.map((m, i) => i === msgIdx ? { ...m, feedback: signal } : m))
        try { await chatApi.submitFeedback({ userId: user._id, feedbackSignal: signal, topic }); refreshUser() } catch { }
    }

    const submitXB = async () => {
        if (!xbText.trim()) return
        setXbLoading(true)
        try {
            const data = await chatApi.explainBack({ userId: user._id, userExplanation: xbText, originalTopic: topic || 'the current topic' })
            setXbResult(data)
            lastXB.current = xbText
        } catch (err) { setXbResult({ assessment: `Error: ${err.message}` }) }
        finally { setXbLoading(false) }
    }

    const getRgExplanation = async () => {
        const msg = messages[rgModal.msgIdx]
        if (!msg) return
        setRgLoading(true)
        try {
            const data = await chatApi.getRegional({ userId: user._id, lastResponse: msg.content, targetLanguage: rgLang })
            setRgResult(data.response)
        } catch (err) { setRgResult(`Error: ${err.message}`) }
        finally { setRgLoading(false) }
    }

    const diffLabel = { easy: 'Easy', medium: 'Medium', hard: 'Advanced' }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 820, margin: '0 auto', padding: '0 clamp(8px,2vw,16px)', background: 'var(--t-bg)' }}>

            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--t-border)', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/dashboard')} style={{ ...btn(false), display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px' }}>
                    <Icon name="arrow-left" size={13} /> Dashboard
                </button>

                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--t-text)' }}>
                        AdaptIQ Chat
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--t-text-3)' }}>
                        {user?.name?.split(' ')[0]} · {diffLabel[user?.currentDifficulty] || 'Medium'} difficulty
                    </div>
                </div>

                <input
                    placeholder="Set topic..."
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--t-input-bg)', border: '1px solid var(--t-border-2)', color: 'var(--t-text)', fontSize: '0.8rem', outline: 'none', width: 140 }}
                />

                <button onClick={() => navigate('/quiz')} style={{ ...btn(false), display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderColor: 'var(--t-border-accent)', color: 'var(--t-accent-2)' }}>
                    <Icon name="brain" size={13} /> Quiz
                </button>

                <ThemeToggle />
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '10vh 20px' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--t-accent)' }}>
                            <Icon name="brain" size={26} />
                        </div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--t-text)', marginBottom: 8 }}>
                            Ready when you are, {user?.name?.split(' ')[0]}
                        </div>
                        <div style={{ fontSize: '0.83rem', color: 'var(--t-text-2)', maxWidth: 360, margin: '0 auto 20px' }}>
                            Every response adapts to your {user?.staticProfile?.experience || 'current'} level. Set a topic for focused learning.
                        </div>
                        {(user?.competencyMetrics?.weakTopics || []).length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
                                {user.competencyMetrics.weakTopics.slice(0, 3).map(t => (
                                    <button key={t} onClick={() => setInput(`Explain ${t} to me`)}
                                        style={{ padding: '6px 14px', borderRadius: 9999, fontSize: '0.78rem', cursor: 'pointer', border: '1px solid var(--t-danger-bd)', background: 'var(--t-danger-bg)', color: 'var(--t-danger-tx)' }}>
                                        Explain {t}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '80%', width: msg.role === 'ai' ? '100%' : 'auto' }}>
                            {msg.role === 'user' ? (
                                <div style={{ background: 'var(--t-accent)', color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', fontSize: '0.9rem', lineHeight: 1.6, boxShadow: '0 4px 14px rgba(58,122,181,0.25)' }}>
                                    {msg.content}
                                </div>
                            ) : (
                                <div style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: '16px 16px 16px 4px', padding: '16px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
                                    {renderAIResponse(msg.content)}

                                    {!msg.isError && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--t-border)', flexWrap: 'wrap' }}>
                                            {/* Feedback buttons */}
                                            {[
                                                { signal: 'too_hard', label: 'Too Hard' },
                                                { signal: 'just_right', label: 'Got It' },
                                                { signal: 'too_easy', label: 'Too Easy' },
                                            ].map(fb => (
                                                <button key={fb.signal}
                                                    onClick={() => submitFeedback(i, fb.signal)}
                                                    style={btn(msg.feedback === fb.signal)}>
                                                    {fb.label}
                                                </button>
                                            ))}

                                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                                                {/* Quiz from Chat */}
                                                <button onClick={() => navigate('/quiz', { state: { context: msg.content, topic: topic || 'current topic' } })}
                                                    title="Take a quick quiz on this topic"
                                                    style={{ ...btn(false), width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7 }}>
                                                    <Icon name="brain" size={13} />
                                                </button>
                                                {/* Explain Back */}
                                                <button onClick={() => { setXbModal({ open: true, msgIdx: i }); setXbText(''); setXbResult(null) }}
                                                    title="Explain back what you understood"
                                                    style={{ ...btn(false), width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7 }}>
                                                    <Icon name="edit" size={13} />
                                                </button>
                                                {/* Regional */}
                                                <button onClick={() => { setRgModal({ open: true, msgIdx: i }); setRgResult(null) }}
                                                    title="Explain in regional language (romanized)"
                                                    style={{ ...btn(false), width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7 }}>
                                                    <Icon name="globe" size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ display: 'flex', gap: 5, padding: '14px 18px', background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--t-accent)', animation: `bounce 1.2s ${i * 0.15}s ease-in-out infinite alternate` }} />
                        ))}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 0 16px', borderTop: '1px solid var(--t-border)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <textarea value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                        placeholder={topic ? `Ask about ${topic}...` : 'Ask anything — your level is auto-detected...'}
                        rows={1} className="t-input"
                        style={{ flex: 1, resize: 'none', lineHeight: 1.5, minHeight: 44, maxHeight: 140 }}
                        onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px` }}
                    />
                    <button onClick={sendMessage} disabled={loading || !input.trim()}
                        style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--t-accent)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (loading || !input.trim()) ? 0.4 : 1, boxShadow: '0 4px 14px rgba(58,122,181,0.3)', transition: 'all 0.2s' }}>
                        <Icon name="arrow" size={18} />
                    </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--t-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="edit" size={10} /> Explain back
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--t-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="globe" size={10} /> Romanized regional
                    </span>
                </div>
            </div>

            {/* Style for bouncing dots */}
            <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }`}</style>

            {/* Explain Back Modal */}
            {xbModal.open && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--t-backdrop)', backdropFilter: 'blur(8px)' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 480, animation: 'fadeSlideIn 0.3s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <Icon name="edit" size={18} style={{ color: 'var(--t-accent)' }} />
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--t-text)' }}>Explain It Back</div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--t-text-3)' }}>Type what you understood — AdaptIQ will assess and adapt</div>
                            </div>
                        </div>
                        {!xbResult ? (
                            <>
                                <textarea value={xbText} onChange={e => setXbText(e.target.value)} placeholder="In my own words, I understood that..." rows={4} className="t-input" style={{ resize: 'none', lineHeight: 1.5, marginBottom: 14 }} />
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setXbModal({ open: false, msgIdx: null })} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                                    <button onClick={submitXB} disabled={xbLoading || !xbText.trim()} className="btn-primary" style={{ flex: 1 }}>
                                        {xbLoading ? 'Assessing...' : 'Submit'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)', marginBottom: 14 }}>
                                    <pre style={{ fontSize: '0.87rem', color: 'var(--t-text)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0 }}>{xbResult.assessment}</pre>
                                </div>
                                {xbResult.comprehensionQuality && (
                                    <div style={{ fontSize: '0.74rem', color: 'var(--t-text-3)', marginBottom: 12 }}>
                                        Comprehension quality: <span style={{ fontWeight: 600, color: xbResult.comprehensionQuality === 'good' ? 'var(--t-success-tx)' : xbResult.comprehensionQuality === 'partial' ? 'var(--t-warn-tx)' : 'var(--t-danger-tx)' }}>{xbResult.comprehensionQuality}</span>
                                    </div>
                                )}
                                <button onClick={() => { setXbModal({ open: false, msgIdx: null }); setXbResult(null) }} className="btn-primary" style={{ width: '100%' }}>Done</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Regional Language Modal */}
            {rgModal.open && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--t-backdrop)', backdropFilter: 'blur(8px)' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 480, animation: 'fadeSlideIn 0.3s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <Icon name="globe" size={18} style={{ color: 'var(--t-accent)' }} />
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--t-text)' }}>Regional Explanation</div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--t-text-3)' }}>Language words, written in English script (romanized)</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--t-text-2)', padding: '8px 10px', borderRadius: 8, background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', marginBottom: 14 }}>
                            Example for Hindi: <em>"Yeh concept bahut important hai kyunki iska matlab hai..."</em>
                        </div>
                        {!rgResult ? (
                            <>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                                    {REGIONAL_LANGUAGES.map(lang => (
                                        <button key={lang} onClick={() => setRgLang(lang)}
                                            style={btn(rgLang === lang, rgLang === lang ? { borderColor: 'var(--t-accent)' } : {})}>
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setRgModal({ open: false, msgIdx: null })} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                                    <button onClick={getRgExplanation} disabled={rgLoading} className="btn-primary" style={{ flex: 1 }}>
                                        {rgLoading ? 'Translating...' : `In ${rgLang}`}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--t-surface-2)', border: '1px solid var(--t-border-2)', marginBottom: 14, maxHeight: 280, overflowY: 'auto' }}>
                                    <pre style={{ fontSize: '0.88rem', color: 'var(--t-text)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: 0 }}>{rgResult}</pre>
                                </div>
                                <button onClick={() => { setRgModal({ open: false, msgIdx: null }); setRgResult(null) }} className="btn-primary" style={{ width: '100%' }}>Done</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
