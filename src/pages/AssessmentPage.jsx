import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { userApi } from '../api/client'
import ThemeToggle from '../components/ui/ThemeToggle'
import Icon from '../components/ui/Icon'

const IMPROVE_OPTIONS = [
    { value: 'Skills', icon: 'zap' },
    { value: 'Exam / Academic', icon: 'grad-cap' },
    { value: 'Job Readiness', icon: 'briefcase' },
    { value: 'Business Growth', icon: 'trending-up' },
    { value: 'Health & Wellness', icon: 'heart' },
    { value: 'Financial Stability', icon: 'bar-chart' },
    { value: 'Mental Clarity', icon: 'brain' },
    { value: 'Communication', icon: 'message' },
    { value: 'Creativity', icon: 'pen' },
    { value: 'Leadership', icon: 'shield' },
]

const LANGUAGES = [
    'English', 'Hindi', 'Telugu', 'Tamil', 'Kannada',
    'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi',
]

function getDynamicProblems(improving, role) {
    const cat = (() => {
        if (['Software Developer', 'Data Scientist', 'UI/UX Designer', 'DevOps Engineer', 'Cybersecurity Analyst'].includes(role)) return 'tech'
        if (['Medical Doctor', 'Nurse / Healthcare Worker', 'Pharmacist', 'Psychologist / Therapist', 'Dentist'].includes(role)) return 'health'
        if (['Entrepreneur / Founder', 'Business Analyst', 'Marketing Specialist', 'Sales Professional', 'Accountant / Finance'].includes(role)) return 'business'
        if (['Student', 'Teacher / Professor', 'Researcher', 'Academic Tutor'].includes(role)) return 'edu'
        if (['Content Creator / Writer', 'Graphic Designer', 'Artist / Illustrator', 'Photographer / Videographer'].includes(role)) return 'creative'
        return 'general'
    })()

    const pool = []

    // Role-specific
    if (cat === 'tech') {
        pool.push({ value: 'technical_gaps', icon: 'code', title: 'Technical Knowledge Gaps', sub: 'Missing core technical foundations' })
        pool.push({ value: 'system_design', icon: 'building', title: 'System Design Clarity', sub: 'Architecture concepts feel abstract' })
        pool.push({ value: 'interview_anxiety', icon: 'briefcase', title: 'Interview Preparedness', sub: 'Not ready for technical interviews' })
    }
    if (cat === 'health') {
        pool.push({ value: 'clinical', icon: 'heart', title: 'Clinical Decision Making', sub: 'Complex cases and diagnostics' })
        pool.push({ value: 'research', icon: 'book', title: 'Medical Research', sub: 'Keeping up with latest evidence' })
        pool.push({ value: 'patient_comm', icon: 'message', title: 'Patient Communication', sub: 'Explaining complex conditions simply' })
    }
    if (cat === 'business') {
        pool.push({ value: 'strategy', icon: 'map', title: 'Strategy Clarity', sub: "Unsure of the right business direction" })
        pool.push({ value: 'growth', icon: 'trending-up', title: 'Scaling & Growth', sub: 'Stuck at the current stage' })
        pool.push({ value: 'finance_literacy', icon: 'bar-chart', title: 'Financial Literacy', sub: 'Managing resources and cash flow' })
    }
    if (cat === 'edu') {
        pool.push({ value: 'concepts', icon: 'book', title: 'Understanding Core Concepts', sub: 'Foundational topics feel unclear' })
        pool.push({ value: 'exam_perf', icon: 'file', title: 'Exam Performance', sub: 'Assessments not reflecting effort' })
        pool.push({ value: 'time', icon: 'clock', title: 'Time Management', sub: 'Struggling to balance study and life' })
    }
    if (cat === 'creative') {
        pool.push({ value: 'block', icon: 'pen', title: 'Creative Block', sub: 'Struggling to find inspiration' })
        pool.push({ value: 'audience', icon: 'users', title: 'Building an Audience', sub: 'Not getting the reach you deserve' })
        pool.push({ value: 'monetize', icon: 'zap', title: 'Monetization', sub: 'Turning creativity into income' })
    }

    // Improvement-based additions
    if (improving.includes('Mental Clarity')) pool.push({ value: 'stress', icon: 'shield', title: 'Stress & Overwhelm', sub: 'Feeling too much pressure' })
    if (improving.includes('Financial Stability')) pool.push({ value: 'finance', icon: 'bar-chart', title: 'Financial Planning', sub: 'Managing money effectively' })
    if (improving.includes('Leadership')) pool.push({ value: 'leadership', icon: 'users', title: 'Leadership Confidence', sub: 'Uncertain how to lead effectively' })
    if (improving.includes('Communication')) pool.push({ value: 'comm', icon: 'message', title: 'Communication Skills', sub: "Ideas don't land the way you want" })

    // Always-available fallbacks
    pool.push({ value: 'direction', icon: 'target', title: 'Unclear Direction', sub: 'Not sure of the right path forward' })
    pool.push({ value: 'consistency', icon: 'clock', title: 'Staying Consistent', sub: 'Hard to build and maintain habits' })

    // Deduplicate
    const seen = new Set()
    return pool.filter(p => { if (seen.has(p.value)) return false; seen.add(p.value); return true }).slice(0, 6)
}

export default function AssessmentPage() {
    const navigate = useNavigate()
    const { user, login } = useUser()

    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState('')
    const [form, setForm] = useState({
        preferredLanguage: user?.staticProfile?.preferredLanguage || 'English',
        targetRole: user?.goals?.targetRole || '',
        improving: [],
        urgentProblem: '',
        success: '',
    })

    const problems = useMemo(
        () => getDynamicProblems(form.improving, user?.staticProfile?.currentRole || ''),
        [form.improving, user]
    )

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const toggleImproving = (val) => {
        update('improving', form.improving.includes(val)
            ? form.improving.filter(v => v !== val)
            : [...form.improving, val])
    }

    const handleSubmit = async () => {
        if (!user) { navigate('/'); return }
        setLoading(true)
        setApiError('')
        try {
            const result = await userApi.updateAssessment(user._id, {
                staticProfile: { preferredLanguage: form.preferredLanguage },
                goals: {
                    urgentProblem: form.urgentProblem,
                    improvingAreas: form.improving,
                    successVision: form.success,
                    targetRole: form.targetRole,
                    timeline: '6 months',
                },
            })
            login(result.user)
            setSubmitted(true)
            setTimeout(() => navigate('/dashboard'), 1800)
        } catch (err) {
            setApiError(err.message || 'Failed to save. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div style={{ minHeight: '100vh', background: 'var(--t-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(12px,3vw,40px)' }}>
            <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}>
                <ThemeToggle />
            </div>

            <div style={{ width: '100%', maxWidth: 640, paddingTop: 24 }}>
                {/* Header */}
                <header style={{ marginBottom: 28 }}>
                    <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--t-text-2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>
                        <Icon name="arrow-left" size={14} /> Registration
                    </button>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.3rem,4vw,1.7rem)', fontWeight: 800, color: 'var(--t-text)', marginBottom: 6 }}>
                        Personal Assessment
                    </h1>
                    <p style={{ color: 'var(--t-text-2)', fontSize: '0.88rem' }}>
                        Help AdaptIQ understand your goals — takes about 2 minutes
                    </p>
                </header>

                {/* Language & target role */}
                <div className="glass-card" style={{ marginBottom: 16, background: 'var(--t-surface-2)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="max-[480px]:!grid-cols-1">
                        <div>
                            <label className="field-label">Preferred Language</label>
                            <select value={form.preferredLanguage} onChange={e => update('preferredLanguage', e.target.value)} className="t-input">
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="field-label">Career Target <span style={{ color: 'var(--t-text-3)', fontWeight: 400 }}>(optional)</span></label>
                            <input
                                className="t-input"
                                placeholder={`e.g. ${user.staticProfile?.currentRole === 'Student' ? 'Software Engineer' : 'Senior ' + (user.staticProfile?.currentRole || 'Professional')}`}
                                value={form.targetRole}
                                onChange={e => update('targetRole', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Goals card */}
                <div className="glass-card" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-accent)' }}>
                            <Icon name="target" size={16} />
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem', color: 'var(--t-text)' }}>Your Goals</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--t-text-3)' }}>What you want to improve with AdaptIQ</div>
                        </div>
                    </div>

                    {/* Improving areas */}
                    <div style={{ marginBottom: 24 }}>
                        <label className="field-label">What are you currently focused on improving?</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                            {IMPROVE_OPTIONS.map(opt => {
                                const sel = form.improving.includes(opt.value)
                                return (
                                    <button key={opt.value} type="button" onClick={() => toggleImproving(opt.value)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 7,
                                            padding: '7px 13px', borderRadius: 9999, fontSize: '0.8rem', cursor: 'pointer',
                                            border: `1.5px solid ${sel ? 'var(--t-accent)' : 'var(--t-border-2)'}`,
                                            background: sel ? 'var(--t-accent-bg)' : 'var(--t-input-bg)',
                                            color: sel ? 'var(--t-accent)' : 'var(--t-text-2)',
                                            fontWeight: sel ? 600 : 400, transition: 'all 0.15s',
                                        }}>
                                        <Icon name={opt.icon} size={13} />
                                        {opt.value}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Dynamic urgent problem */}
                    <div style={{ marginBottom: 24 }}>
                        <label className="field-label">What feels most urgent right now?</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }} className="max-[480px]:!grid-cols-1">
                            {problems.map(p => (
                                <button key={p.value} type="button" onClick={() => update('urgentProblem', p.value)}
                                    style={{
                                        padding: '12px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                                        border: `1.5px solid ${form.urgentProblem === p.value ? 'var(--t-accent)' : 'var(--t-border)'}`,
                                        background: form.urgentProblem === p.value ? 'var(--t-accent-bg)' : 'var(--t-input-bg)',
                                        color: 'var(--t-text)', transition: 'all 0.15s',
                                        display: 'flex', alignItems: 'flex-start', gap: 10,
                                    }}>
                                    <div style={{ color: form.urgentProblem === p.value ? 'var(--t-accent)' : 'var(--t-text-3)', flexShrink: 0, marginTop: 2 }}>
                                        <Icon name={p.icon} size={15} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>{p.title}</div>
                                        <div style={{ fontSize: '0.73rem', color: 'var(--t-text-2)', marginTop: 2 }}>{p.sub}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Success vision */}
                    <div>
                        <label className="field-label" htmlFor="success">In 6 months, what would success look like?</label>
                        <textarea id="success" className="t-input"
                            style={{ resize: 'vertical', minHeight: 88, lineHeight: 1.6 }}
                            placeholder="Describe your ideal outcome — be specific about what you want to achieve..."
                            value={form.success}
                            onChange={e => update('success', e.target.value)}
                        />
                    </div>
                </div>

                {apiError && (
                    <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--t-danger-bg)', border: '1px solid var(--t-danger-bd)', color: 'var(--t-danger-tx)', fontSize: '0.83rem', marginBottom: 16 }}>
                        {apiError}
                    </div>
                )}

                {submitted ? (
                    <div className="glass-card" style={{ textAlign: 'center', background: 'var(--t-success-bg)', borderColor: 'var(--t-success-bd)' }}>
                        <Icon name="check" size={28} style={{ color: 'var(--t-success-tx)', margin: '0 auto 10px' }} />
                        <div style={{ fontWeight: 700, color: 'var(--t-success-tx)', marginBottom: 4 }}>Assessment saved</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--t-text-2)' }}>Taking you to your dashboard...</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 12, paddingBottom: 32 }}>
                        <button onClick={() => navigate('/')} className="btn-ghost">
                            <Icon name="arrow-left" size={15} /> Back
                        </button>
                        <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                            {loading ? 'Saving...' : 'Save & Open Dashboard'}
                            {!loading && <Icon name="arrow" size={15} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
