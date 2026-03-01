import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { careerApi, userApi } from '../api/client'
import ThemeToggle from '../components/ui/ThemeToggle'
import Icon from '../components/ui/Icon'

// Avatar component with initials or image
function Avatar({ name, image, size = 38, onClick, editable = false }) {
    const colors = ['#2B5F99', '#1E6B75', '#4A3E8A', '#6B3E3E', '#3E6B3E', '#7A5E2A']
    const idx = (name || '?').charCodeAt(0) % colors.length
    const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

    return (
        <div style={{ position: 'relative' }}>
            <button onClick={onClick} title={editable ? "Change profile picture" : "Edit profile"}
                style={{
                    width: size, height: size, borderRadius: '50%',
                    background: colors[idx], border: '2px solid var(--t-border-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: size / 2.6,
                    color: '#fff', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    padding: 0
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {image ? (
                    <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials}
            </button>
            {editable && (
                <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--t-accent)', color: '#fff', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--t-bg)', pointerEvents: 'none' }}>
                    <Icon name="edit" size={10} />
                </div>
            )}
        </div>
    )
}

// Profile edit modal
function ProfileModal({ user, onClose, onSave, onDelete, logout }) {
    const fileRef = useRef(null)
    const [form, setForm] = useState({
        name: user?.name || '',
        currentRole: user?.staticProfile?.currentRole || '',
        experience: user?.staticProfile?.experience || '',
        preferredLanguage: user?.staticProfile?.preferredLanguage || 'English',
        targetRole: user?.goals?.targetRole || '',
        responseStyle: user?.preferences?.responseStyle || '',
        customInstructions: user?.preferences?.customInstructions || '',
        profilePic: user?.profilePic || null,
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)

    const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

    const handleFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => update('profilePic', reader.result)
        reader.readAsDataURL(file)
    }

    const save = async () => {
        setSaving(true)
        try {
            const result = await userApi.updateAssessment(user._id, {
                name: form.name,
                profilePic: form.profilePic,
                staticProfile: {
                    currentRole: form.currentRole,
                    experience: form.experience,
                    preferredLanguage: form.preferredLanguage,
                },
                goals: { targetRole: form.targetRole },
                preferences: {
                    responseStyle: form.responseStyle,
                    customInstructions: form.customInstructions,
                },
            })
            onSave(result.user)
            setSaved(true)
            setTimeout(onClose, 1200)
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    const handleDelete = async () => {
        try {
            await userApi.deleteAccount(user._id)
            onDelete()
        } catch (err) { alert(err.message) }
    }

    const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 10, background: 'var(--t-input-bg)', border: '1.5px solid var(--t-border-2)', color: 'var(--t-text)', fontSize: '0.87rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }
    const label = { display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--t-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--t-backdrop)', backdropFilter: 'blur(10px)' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', animation: 'fadeSlideIn 0.3s ease-out', position: 'relative' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <Avatar name={form.name} image={form.profilePic} size={50} editable onClick={() => fileRef.current?.click()} />
                        <input type="file" ref={fileRef} hidden onChange={handleFile} accept="image/*" />
                        <div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--t-text)', fontSize: '1.1rem' }}>Profile Settings</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--t-text-3)' }}>{user?.email}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--t-hover)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-text-2)' }}>
                        <Icon name="x" size={14} />
                    </button>
                </div>

                {/* AI Knowledge Summary Section */}
                {(user.uploadedProfileSummary || user.recentSummary) && (
                    <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--t-accent)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            <Icon name="brain" size={12} /> AI Context Summary
                        </div>
                        <div style={{ maxHeight: 120, overflowY: 'auto', fontSize: '0.8rem', color: 'var(--t-text-2)', lineHeight: 1.5, fontStyle: 'italic' }}>
                            {user.uploadedProfileSummary || user.recentSummary}
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="max-[480px]:!grid-cols-1">
                    <div><label style={label}>Full Name</label><input style={inputStyle} value={form.name} onChange={e => update('name', e.target.value)} /></div>
                    <div><label style={label}>Current Role</label><input style={inputStyle} value={form.currentRole} onChange={e => update('currentRole', e.target.value)} /></div>
                    <div><label style={label}>Experience</label>
                        <select style={{ ...inputStyle, appearance: 'none' }} value={form.experience} onChange={e => update('experience', e.target.value)}>
                            {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div><label style={label}>Career Target</label><input style={inputStyle} placeholder="e.g. Senior Engineer" value={form.targetRole} onChange={e => update('targetRole', e.target.value)} /></div>
                    <div><label style={label}>Preferred Language</label>
                        <select style={{ ...inputStyle, appearance: 'none' }} value={form.preferredLanguage} onChange={e => update('preferredLanguage', e.target.value)}>
                            {['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Marathi'].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div><label style={label}>Explanation Style</label>
                        <select style={{ ...inputStyle, appearance: 'none' }} value={form.responseStyle} onChange={e => update('responseStyle', e.target.value)}>
                            {['Concise', 'Detailed', 'Step-by-step', 'Conversational'].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={label}>Custom AI Instructions</label>
                    <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72, lineHeight: 1.5 }}
                        placeholder="e.g. Always use real-world examples..."
                        value={form.customInstructions} onChange={e => update('customInstructions', e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--t-border)', paddingBottom: 20, marginBottom: 20 }}>
                    <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={save} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
                        {!saving && !saved && <Icon name="check" size={14} />}
                    </button>
                </div>

                {/* Delete Account Section */}
                <div style={{ textAlign: 'center' }}>
                    {!showConfirmDelete ? (
                        <button onClick={() => setShowConfirmDelete(true)}
                            style={{ background: 'none', border: 'none', color: 'var(--t-danger-tx)', fontSize: '0.78rem', textDecoration: 'underline', cursor: 'pointer', opacity: 0.7 }}>
                            Delete my account
                        </button>
                    ) : (
                        <div style={{ animation: 'fadeSlideIn 0.2s ease-out' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--t-danger-tx)', fontWeight: 600, marginBottom: 12 }}>Are you absolutely sure?</div>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                <button onClick={() => setShowConfirmDelete(false)} style={{ ...inputStyle, width: 'auto', padding: '6px 16px', background: 'var(--t-surface)' }}>Cancel</button>
                                <button onClick={handleDelete} style={{ ...inputStyle, width: 'auto', padding: '6px 16px', background: 'var(--t-danger-bg)', borderColor: 'var(--t-danger-bd)', color: 'var(--t-danger-tx)' }}>
                                    Yes, Delete Forever
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function MetricBar({ label, value, pct, icon }) {
    return (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--t-surface-2)', border: '1px solid var(--t-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--t-text-3)' }}>
                    <Icon name={icon} size={13} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--t-text)' }}>{value}</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
        </div>
    )
}

export default function DashboardPage() {
    const { user, refreshUser, logout, updateUserLocally } = useUser()
    const navigate = useNavigate()
    const [gapData, setGapData] = useState(null)
    const [profileOpen, setProfileOpen] = useState(false)

    useEffect(() => {
        if (!user) { navigate('/'); return }
        refreshUser()
        if (user?._id) careerApi.getGap(user._id).then(d => setGapData(d.gapData)).catch(() => { })
    }, [])

    if (!user) return null

    const metrics = user.competencyMetrics || {}
    const behavior = user.behaviorMetrics || {}
    const goals = user.goals || {}
    const skillPct = ((metrics.skillLevel || 1) / 5) * 100

    const navCards = [
        { icon: 'message', label: 'AI Chat', sub: 'Personalized explanations', path: '/chat', color: 'var(--t-accent)' },
        { icon: 'brain', label: 'Adaptive Quiz', sub: 'Test your knowledge', path: '/quiz', color: '#2A7A6A' },
        { icon: 'map', label: 'Career Map', sub: 'Skill gap analysis', path: '/career', color: '#1E5E8C' },
        { icon: 'upload', label: 'Import History', sub: 'Sync AI conversations', path: '/upload', color: '#6B4A20' },
    ]

    return (
        <div style={{ minHeight: '100vh', background: 'var(--t-bg)', padding: 'clamp(12px,3vw,32px)' }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>

                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
                    <Avatar name={user.name} image={user.profilePic} size={44} onClick={() => setProfileOpen(true)} />
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.1rem,3vw,1.5rem)', fontWeight: 700, color: 'var(--t-text)', marginBottom: 2 }}>
                            {user.name?.split(' ')[0]}'s Dashboard
                        </h1>
                        <div style={{ fontSize: '0.75rem', color: 'var(--t-text-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{user.staticProfile?.currentRole || 'Learner'}</span>
                            <span>·</span>
                            <span>{user.staticProfile?.experience || 'Beginner'}</span>
                            <span>·</span>
                            <span style={{ color: 'var(--t-accent)' }}>Difficulty: {user.currentDifficulty || 'medium'}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button onClick={() => setProfileOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, background: 'var(--t-surface)', border: '1px solid var(--t-border)', color: 'var(--t-text-2)', fontSize: '0.78rem', cursor: 'pointer' }}>
                            <Icon name="edit" size={13} /> Edit Profile
                        </button>
                        <ThemeToggle />
                        <button onClick={() => { logout(); navigate('/') }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, background: 'var(--t-danger-bg)', border: '1px solid var(--t-danger-bd)', color: 'var(--t-danger-tx)', fontSize: '0.78rem', cursor: 'pointer' }}>
                            <Icon name="log-out" size={13} /> Sign Out
                        </button>
                    </div>
                </header>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }} className="md:!grid-cols-4">
                    <MetricBar label="Skill Level" value={`${metrics.skillLevel || 1}/5`} pct={skillPct} icon="zap" />
                    <MetricBar label="Confidence" value={`${metrics.confidenceScore || 50}%`} pct={metrics.confidenceScore || 50} icon="shield" />
                    <MetricBar label="Quiz Accuracy" value={`${behavior.quizAccuracy || 0}%`} pct={behavior.quizAccuracy || 0} icon="target" />
                    <MetricBar label="Engagement" value={`${behavior.engagementScore || 50}%`} pct={behavior.engagementScore || 50} icon="trending-up" />
                </div>

                {/* Topics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }} className="max-[640px]:!grid-cols-1">
                    <div className="glass-card" style={{ background: 'var(--t-surface-2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, color: 'var(--t-danger-tx)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            <Icon name="info" size={12} /> Weak Topics
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {metrics.weakTopics?.length > 0
                                ? metrics.weakTopics.map(t => <span key={t} style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', background: 'var(--t-danger-bg)', border: '1px solid var(--t-danger-bd)', color: 'var(--t-danger-tx)' }}>{t}</span>)
                                : <span style={{ fontSize: '0.8rem', color: 'var(--t-text-3)' }}>None identified yet</span>
                            }
                        </div>
                    </div>
                    <div className="glass-card" style={{ background: 'var(--t-surface-2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, color: 'var(--t-success-tx)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            <Icon name="check" size={12} /> Strong Topics
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {metrics.strongTopics?.length > 0
                                ? metrics.strongTopics.map(t => <span key={t} style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', background: 'var(--t-success-bg)', border: '1px solid var(--t-border-bd)', color: 'var(--t-success-tx)' }}>{t}</span>)
                                : <span style={{ fontSize: '0.8rem', color: 'var(--t-text-3)' }}>Complete quizzes to find strengths</span>
                            }
                        </div>
                    </div>
                </div>

                {/* Goal snapshot */}
                {(goals.targetRole || goals.successVision) && (
                    <div className="glass-card" style={{ marginBottom: 16, background: 'var(--t-surface-2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--t-text-3)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            <Icon name="target" size={12} /> Goal
                        </div>
                        {goals.targetRole && <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--t-accent)', marginBottom: 4 }}>{goals.targetRole}</div>}
                        {goals.successVision && <div style={{ fontSize: '0.83rem', color: 'var(--t-text-2)', fontStyle: 'italic' }}>"{goals.successVision}"</div>}
                        {gapData && (
                            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="progress-track" style={{ flex: 1 }}>
                                    <div className="progress-fill" style={{ width: `${Math.max(0, 100 - gapData.overallGapPercent)}%` }} />
                                </div>
                                <span style={{ fontSize: '0.73rem', color: 'var(--t-text-3)', whiteSpace: 'nowrap' }}>
                                    {100 - gapData.overallGapPercent}% toward {gapData.matchedRole}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Nav */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }} className="md:!grid-cols-4">
                    {navCards.map(card => (
                        <button key={card.path} onClick={() => navigate(card.path)}
                            style={{ padding: '18px 16px', borderRadius: 14, background: 'var(--t-surface)', border: '1px solid var(--t-border)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.border = '1px solid var(--t-border-accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--t-border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: card.color + '22', border: `1px solid ${card.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, marginBottom: 10 }}>
                                <Icon name={card.icon} size={16} />
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.88rem', color: 'var(--t-text)', marginBottom: 3 }}>{card.label}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--t-text-3)' }}>{card.sub}</div>
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="glass-card" style={{ background: 'var(--t-surface-2)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--t-accent)' }}>{user.interactionCount || 0}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--t-text-3)', marginTop: 3 }}>Interactions</div>
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--t-success-tx)' }}>{behavior.totalQuizzesTaken || 0}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--t-text-3)', marginTop: 3 }}>Quizzes</div>
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--t-text-2)' }}>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Today'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--t-text-3)', marginTop: 3 }}>Last Active</div>
                        </div>
                    </div>
                </div>
            </div>

            {profileOpen && (
                <ProfileModal
                    user={user}
                    onClose={() => setProfileOpen(false)}
                    onSave={(updated) => { updateUserLocally(updated); setProfileOpen(false) }}
                    onDelete={() => { logout(); navigate('/') }}
                />
            )}
        </div>
    )
}
