import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { uploadApi } from '../api/client'
import ThemeToggle from '../components/ui/ThemeToggle'
import Icon from '../components/ui/Icon'

export default function UploadPage() {
    const { user, refreshUser } = useUser()
    const navigate = useNavigate()

    const [dragging, setDragging] = useState(false)
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    const lastUpload = user?.updatedAt ? new Date(user.updatedAt) : null
    const daysSinceUpload = lastUpload ? Math.floor((Date.now() - lastUpload) / (1000 * 60 * 60 * 24)) : null

    useEffect(() => { if (!user) navigate('/') }, [user])

    const handleFile = (f) => {
        if (!f) return
        if (!f.name.endsWith('.json')) { setError('Please upload a .json file.'); return }
        setFile(f); setError(''); setResult(null)
    }

    const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }

    const handleUpload = async () => {
        if (!file || !user?._id) return
        setLoading(true); setError('')
        try {
            const data = await uploadApi.parseConversation(user._id, file)
            setResult(data); refreshUser()
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--t-bg)', padding: 'clamp(12px,3vw,40px)' }}>
            <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}><ThemeToggle /></div>

            <div style={{ maxWidth: 680, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <button onClick={() => navigate('/dashboard')} style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--t-surface)', border: '1px solid var(--t-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-text-2)', cursor: 'pointer' }}>
                        <Icon name="arrow-left" size={14} />
                    </button>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 700, color: 'var(--t-text)' }}>
                            Import AI History
                        </h1>
                        <p style={{ color: 'var(--t-text-2)', fontSize: '0.78rem' }}>Upload ChatGPT or Gemini exports to enrich your learning profile</p>
                    </div>
                </div>

                {/* Freshness banner — only show if profile is stale */}
                {daysSinceUpload !== null && daysSinceUpload >= 7 && !result && (
                    <div style={{ display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--t-warn-bg)', border: '1px solid var(--t-warn-bd)', marginBottom: 18 }}>
                        <Icon name="refresh" size={16} style={{ color: 'var(--t-warn-tx)', flexShrink: 0, marginTop: 1 }} />
                        <div>
                            <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--t-warn-tx)' }}>Your profile is {daysSinceUpload} days old</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--t-text-2)', marginTop: 2 }}>
                                Upload recent conversations to keep AdaptIQ's personalization sharp. Fresh data = better responses.
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload frequently reminder (always visible) */}
                <div style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)', marginBottom: 20 }}>
                    <Icon name="info" size={14} style={{ color: 'var(--t-accent)', flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: '0.76rem', color: 'var(--t-text-2)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--t-accent)' }}>Upload regularly</strong> — every 1–2 weeks keeps your AI profile current. As your conversations grow, AdaptIQ learns more about your patterns and gaps.
                    </div>
                </div>

                {/* How it works */}
                <div className="glass-card" style={{ marginBottom: 16, background: 'var(--t-surface-2)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--t-text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                        How it works
                    </div>
                    {[
                        { icon: 'upload', text: 'Export your ChatGPT or Gemini conversation history as JSON' },
                        { icon: 'user', text: 'AdaptIQ reads only YOUR messages — AI responses are discarded' },
                        { icon: 'brain', text: 'Groq extracts your topics, struggles, and learning style in one pass' },
                        { icon: 'shield', text: 'Raw conversation is deleted immediately — only a structured summary is stored' },
                        { icon: 'zap', text: 'Your AI profile is enriched for better personalized responses right away' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 4 ? 12 : 0, alignItems: 'flex-start' }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-accent)', flexShrink: 0 }}>
                                <Icon name={item.icon} size={13} />
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--t-text-2)', margin: 0, paddingTop: 5 }}>{item.text}</p>
                        </div>
                    ))}
                </div>

                {/* Drop Zone */}
                {!result && (
                    <div className="glass-card" style={{ marginBottom: 16 }}>
                        <div onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)}
                            onClick={() => document.getElementById('fi').click()}
                            style={{
                                border: `2px dashed ${dragging ? 'var(--t-accent)' : file ? 'var(--t-success-bd)' : 'var(--t-border-2)'}`,
                                borderRadius: 14, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                                background: dragging ? 'var(--t-accent-bg)' : file ? 'var(--t-success-bg)' : 'var(--t-input-bg)',
                                transition: 'all 0.2s',
                            }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: file ? 'var(--t-success-tx)' : 'var(--t-text-3)' }}>
                                <Icon name={file ? 'check' : 'upload'} size={20} />
                            </div>
                            {file ? (
                                <>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--t-success-tx)', marginBottom: 4 }}>{file.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--t-text-3)' }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--t-text)', marginBottom: 4 }}>Drop your JSON file here</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--t-text-3)' }}>Or click to browse · Max 50 MB</div>
                                </>
                            )}
                            <input id="fi" type="file" accept=".json" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                        </div>

                        {error && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--t-danger-bg)', border: '1px solid var(--t-danger-bd)', color: 'var(--t-danger-tx)', fontSize: '0.82rem' }}>{error}</div>}

                        <button onClick={handleUpload} disabled={!file || loading} className="btn-primary" style={{ width: '100%', marginTop: 16 }}>
                            {loading ? 'Analyzing your messages...' : 'Analyze & Enrich Profile'}
                            {!loading && <Icon name="arrow" size={15} />}
                        </button>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="glass-card" style={{ marginBottom: 16, border: '1px solid var(--t-success-bd)', background: 'var(--t-success-bg)', animation: 'fadeSlideIn 0.4s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <Icon name="check" size={20} style={{ color: 'var(--t-success-tx)' }} />
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--t-success-tx)' }}>Profile Enriched</div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--t-text-3)' }}>{result.messageCount} messages analyzed</div>
                            </div>
                        </div>

                        {result.extracted?.dominantTopics?.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--t-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Topics Detected</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {result.extracted.dominantTopics.map(t => (
                                        <span key={t} style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)', color: 'var(--t-accent-2)' }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {result.extracted?.recurringStruggles?.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--t-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Recurring Struggles</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {result.extracted.recurringStruggles.map(s => (
                                        <span key={s} style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', background: 'var(--t-danger-bg)', border: '1px solid var(--t-danger-bd)', color: 'var(--t-danger-tx)' }}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {result.extracted?.summary && (
                            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--t-surface)', border: '1px solid var(--t-border)', marginBottom: 14 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--t-text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Summary</div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--t-text-2)', fontStyle: 'italic', margin: 0 }}>"{result.extracted.summary}"</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => { setResult(null); setFile(null) }} className="btn-ghost" style={{ flex: 1 }}>Upload Another</button>
                            <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ flex: 1 }}>View Dashboard <Icon name="arrow" size={15} /></button>
                        </div>
                    </div>
                )}

                {/* Export instructions */}
                <div className="glass-card" style={{ background: 'var(--t-surface-2)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.82rem', color: 'var(--t-text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>How to Export</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="max-[480px]:!grid-cols-1">
                        {[
                            { name: 'ChatGPT', steps: 'Settings → Data Controls → Export Data → Download ZIP → use conversations.json' },
                            { name: 'Gemini', steps: 'Google Takeout → Select Gemini Apps Activity → Export → use the .json file' },
                        ].map(src => (
                            <div key={src.name} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--t-text)', marginBottom: 4 }}>{src.name}</div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--t-text-3)', lineHeight: 1.5 }}>{src.steps}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
