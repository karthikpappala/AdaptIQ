import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { careerApi } from '../api/client'
import ThemeToggle from '../components/ui/ThemeToggle'
import Icon from '../components/ui/Icon'

export default function CareerPage() {
    const { user, refreshUser } = useUser()
    const navigate = useNavigate()

    const [gapData, setGapData] = useState(null)
    const [roles, setRoles] = useState([])
    const [selectedRole, setSelectedRole] = useState('')
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!user) { navigate('/'); return }
        Promise.all([
            careerApi.getGap(user._id),
            careerApi.listRoles(),
        ]).then(([gapRes, rolesRes]) => {
            setGapData(gapRes.gapData)
            setRoles(rolesRes.roles)
            setSelectedRole(gapRes.gapData?.targetRole || user.goals?.targetRole || '')
        }).catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const updateRole = async () => {
        if (!selectedRole) return
        setUpdating(true)
        try {
            const data = await careerApi.updateTargetRole(user._id, selectedRole)
            setGapData(data.gapData)
            refreshUser()
        } catch (err) { setError(err.message) }
        finally { setUpdating(false) }
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--t-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-accent)', margin: '0 auto 16px', animation: 'logoPulse 2s infinite' }}>
                    <Icon name="map" size={20} />
                </div>
                <p style={{ color: 'var(--t-text-3)', fontSize: '0.85rem' }}>Analyzing skill gaps...</p>
            </div>
        </div>
    )

    const completionPct = gapData ? 100 - gapData.overallGapPercent : 0

    return (
        <div style={{ minHeight: '100vh', background: 'var(--t-bg)', padding: 'clamp(12px,3vw,32px)' }}>
            <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}><ThemeToggle /></div>

            <div style={{ maxWidth: 820, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <button onClick={() => navigate('/dashboard')} style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--t-surface)', border: '1px solid var(--t-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-text-2)', cursor: 'pointer' }}>
                        <Icon name="arrow-left" size={14} />
                    </button>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 700, color: 'var(--t-text)' }}>
                            Career Intelligence
                        </h1>
                        <p style={{ color: 'var(--t-text-2)', fontSize: '0.78rem' }}>Rule-based assessment for <span style={{ color: 'var(--t-accent)', fontWeight: 600 }}>{selectedRole || 'your target role'}</span></p>
                    </div>
                </div>

                {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--t-danger-bg)', border: '1px solid var(--t-danger-bd)', color: 'var(--t-danger-tx)', fontSize: '0.82rem', marginBottom: 20 }}>{error}</div>}

                {/* Role Selector */}
                <div className="glass-card" style={{ marginBottom: 16 }}>
                    <label className="field-label">Target Role</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <select
                            value={selectedRole}
                            onChange={e => setSelectedRole(e.target.value)}
                            className="t-input"
                            style={{ flex: 1 }}
                        >
                            <option value="">Select your target role</option>
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={updateRole} disabled={updating || !selectedRole} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                            {updating ? 'Updating...' : 'Refresh Analysis'}
                            {!updating && <Icon name="refresh" size={14} />}
                        </button>
                    </div>
                </div>

                {gapData && (
                    <div className="animate-fade-slide">
                        {/* Readiness Summary */}
                        <div className="glass-card" style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--t-text)' }}>{completionPct}% Ready</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--t-text-3)', marginTop: 2 }}>{gapData.totalKnown} of {gapData.totalRequired} core skills covered</div>
                                </div>
                                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--t-accent-bg)', border: '2px solid var(--t-border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-accent)', fontWeight: 800, fontSize: '0.9rem' }}>
                                    {completionPct}%
                                </div>
                            </div>
                            <div className="progress-track"><div className="progress-fill" style={{ width: `${completionPct}%` }} /></div>
                        </div>

                        {/* Category Breakdown */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
                            {gapData.categories.map(cat => (
                                <div key={cat.name} className="glass-card" style={{ background: 'var(--t-surface-2)', padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--t-text)', textTransform: 'capitalize' }}>{cat.name}</div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: cat.completionPct >= 70 ? 'var(--t-success-tx)' : cat.completionPct >= 40 ? 'var(--t-warn-tx)' : 'var(--t-danger-tx)' }}>
                                            {cat.completionPct}%
                                        </div>
                                    </div>
                                    <div className="progress-track" style={{ marginBottom: 16, height: 2 }}>
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${cat.completionPct}%`,
                                                background: cat.completionPct >= 70 ? 'var(--t-success-tx)' : cat.completionPct >= 40 ? 'var(--t-warn-tx)' : 'var(--t-danger-tx)'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {cat.known.length > 0 && (
                                            <div>
                                                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--t-success-tx)', textTransform: 'uppercase', marginBottom: 5 }}>Skills Known</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                    {cat.known.map(s => <span key={s} style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--t-success-bg)', color: 'var(--t-success-tx)', fontSize: '0.7rem' }}>{s}</span>)}
                                                </div>
                                            </div>
                                        )}
                                        {cat.missing.length > 0 && (
                                            <div>
                                                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--t-danger-tx)', textTransform: 'uppercase', marginBottom: 5 }}>Missing Gaps</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                    {cat.missing.map(s => <button key={s} onClick={() => navigate(`/chat?topic=${encodeURIComponent(s)}`)} style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--t-danger-bg)', border: '1px solid var(--t-danger-bd)', color: 'var(--t-danger-tx)', fontSize: '0.7rem', cursor: 'pointer' }}>{s} +</button>)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Learning Path */}
                        {gapData.missingSkills.length > 0 && (
                            <div className="glass-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <Icon name="map" size={16} style={{ color: 'var(--t-accent)' }} />
                                    <div style={{ fontWeight: 600, color: 'var(--t-text)' }}>Priority Roadmap</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {gapData.missingSkills.slice(0, 8).map((item, idx) => (
                                        <button key={item.skill} onClick={() => navigate(`/chat?topic=${encodeURIComponent(item.skill)}`)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12,
                                                background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-accent)'; e.currentTarget.style.background = 'var(--t-hover)' }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border)'; e.currentTarget.style.background = 'var(--t-surface-2)' }}
                                        >
                                            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-accent)', fontSize: '0.7rem', fontWeight: 700 }}>
                                                {idx + 1}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--t-text)' }}>{item.skill}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--t-text-3)', textTransform: 'capitalize' }}>{item.category} gap</div>
                                            </div>
                                            <Icon name="arrow" size={13} style={{ opacity: 0.3 }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingBottom: 20 }}>
                    <button onClick={() => navigate('/chat')} className="btn-primary" style={{ flex: 1 }}>
                        Learn Missing Skills <Icon name="message" size={15} />
                    </button>
                    <button onClick={() => navigate('/quiz')} className="btn-ghost" style={{ flex: 1 }}>
                        Take Skills Validation <Icon name="shield" size={15} />
                    </button>
                </div>
            </div>
        </div>
    )
}
