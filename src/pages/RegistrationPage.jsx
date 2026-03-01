import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepAccount from '../components/Registration/StepAccount'
import StepProfile from '../components/Registration/StepProfile'
import StepPreferences from '../components/Registration/StepPreferences'
import { userApi } from '../api/client'
import { useUser } from '../context/UserContext'
import ThemeToggle from '../components/ui/ThemeToggle'
import Icon from '../components/ui/Icon'

const STEPS = ['Account', 'Profile', 'Preferences']

export default function RegistrationPage() {
    const navigate = useNavigate()
    const { login } = useUser()

    const [isLogin, setIsLogin] = useState(false)
    const [step, setStep] = useState(1)
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState('')
    const [errors, setErrors] = useState({})
    const [data, setData] = useState({
        firstName: '', lastName: '', email: '', profilePic: null,
        role: '', industry: '', experience: '',
        responseStyle: '', useCase: '', topics: [], customPrompt: '',
        wantsUpload: false,
    })

    const onChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: undefined }))
        setApiError('')
    }

    const validate = (s) => {
        const errs = {}
        if (s === 1) {
            if (!data.firstName.trim()) errs.firstName = 'First name is required'
            if (!data.lastName.trim()) errs.lastName = 'Last name is required'
            if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
                errs.email = 'Valid email required'
        }
        if (s === 2) {
            if (!data.role) errs.role = 'Please select your role'
            if (!data.experience) errs.experience = 'Please select experience level'
        }
        if (s === 3) {
            // Only require manual fields if the user opts out of JSON upload
            if (!data.wantsUpload) {
                if (!data.responseStyle) errs.responseStyle = 'Please select an explanation style'
                if (!data.useCase) errs.useCase = 'Please select a use case'
            }
        }
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const next = () => { if (validate(step) && step < 3) setStep(step + 1) }
    const prev = () => { if (step > 1) setStep(step - 1) }

    const submit = async () => {
        if (isLogin) {
            if (!data.email.trim()) { setErrors({ email: 'Email required' }); return }
            setLoading(true)
            try {
                const result = await userApi.getByEmail(data.email)
                login(result.user)
                navigate('/dashboard')
            } catch (err) { setApiError('User not found. Please create a profile first.') }
            finally { setLoading(false) }
            return
        }

        if (!validate(3)) return
        setLoading(true)
        setApiError('')
        try {
            const result = await userApi.register({
                email: data.email,
                name: `${data.firstName} ${data.lastName}`.trim(),
                profilePic: data.profilePic,
                staticProfile: {
                    currentRole: data.role,
                    industry: data.industry,
                    experience: data.experience,
                    preferredLanguage: 'English',
                },
                preferences: {
                    responseStyle: data.responseStyle,
                    explanationStyle: data.responseStyle,
                    useCase: data.useCase,
                    topics: data.topics,
                    customInstructions: data.customPrompt,
                },
            })
            login(result.user)
            if (result.returning) {
                navigate('/dashboard')
            } else {
                setSubmitted(true)
            }
        } catch (err) {
            setApiError(err.message || 'Failed to create profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const pct = ((step - 1) / (STEPS.length - 1)) * 100

    return (
        <div style={{ minHeight: '100vh', background: 'var(--t-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px,3vw,40px)' }}>

            {/* Theme & Login toggle - top right */}
            <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50, display: 'flex', gap: 14, alignItems: 'center' }}>
                {!isLogin && !submitted && (
                    <button onClick={() => { setIsLogin(true); setApiError(''); setErrors({}) }}
                        style={{ padding: '6px 14px', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 600, background: 'var(--t-accent-bg)', border: '1px solid var(--t-accent)', color: 'var(--t-accent)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Login
                    </button>
                )}
                <ThemeToggle />
            </div>

            <div style={{ width: '100%', maxWidth: 600 }}>
                {/* Header */}
                {!submitted && (
                    <header style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: 'var(--t-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px', color: '#fff',
                            animation: 'logoPulse 4s ease-in-out infinite',
                            boxShadow: '0 0 32px rgba(58,122,181,0.25)',
                        }}>
                            <Icon name="brain" size={24} />
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.3rem,4vw,1.8rem)', fontWeight: 800, color: 'var(--t-text)', marginBottom: 6 }}>
                            AdaptIQ
                        </h1>
                        <p style={{ color: 'var(--t-text-2)', fontSize: 'clamp(0.8rem,2vw,0.9rem)' }}>
                            Adaptive learning, built around you
                        </p>
                    </header>
                )}

                {/* Progress bar */}
                {!submitted && !isLogin && (
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            {STEPS.map((s, i) => (
                                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%', fontSize: '0.68rem', fontWeight: 700,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: i + 1 < step ? 'var(--t-accent)' : i + 1 === step ? 'var(--t-accent-bg)' : 'var(--t-border-2)',
                                        border: `1.5px solid ${i + 1 <= step ? 'var(--t-accent)' : 'var(--t-border-2)'}`,
                                        color: i + 1 < step ? '#fff' : i + 1 === step ? 'var(--t-accent)' : 'var(--t-text-3)',
                                        transition: 'all 0.3s',
                                    }}>
                                        {i + 1 < step ? <Icon name="check" size={11} /> : i + 1}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: i + 1 === step ? 'var(--t-accent)' : 'var(--t-text-3)', fontWeight: i + 1 === step ? 600 : 400 }}>{s}</span>
                                </div>
                            ))}
                        </div>
                        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                    </div>
                )}

                {/* Card */}
                <div className="glass-card">
                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', animation: 'fadeSlideIn 0.4s ease-out' }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--t-success-bg)', border: '2px solid var(--t-success-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'successPop 0.5s ease', color: 'var(--t-success-tx)' }}>
                                <Icon name="check" size={28} strokeWidth={2.5} />
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--t-text)', marginBottom: 8 }}>Profile Created</h2>
                            <p style={{ color: 'var(--t-text-2)', fontSize: '0.88rem', marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
                                Your AI profile is ready. Complete the assessment to calibrate it to your exact level.
                            </p>
                            <button onClick={() => navigate('/assessment')} className="btn-primary">
                                Continue to Assessment <Icon name="arrow" size={15} />
                            </button>
                        </div>
                    ) : isLogin ? (
                        <div className="animate-fade-slide">
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.1rem,3vw,1.3rem)', fontWeight: 700, color: 'var(--t-text)', marginBottom: 4 }}>
                                Sign In
                            </h2>
                            <p style={{ color: 'var(--t-text-2)', fontSize: '0.85rem', marginBottom: 28 }}>
                                Enter your email to restore your profile
                            </p>
                            <div style={{ marginBottom: 20 }}>
                                <label className="field-label" htmlFor="email-login">Email Address</label>
                                {errors.email && <div style={{ color: 'var(--t-danger-tx)', fontSize: '0.72rem', marginBottom: 4 }}>{errors.email}</div>}
                                <input id="email-login" type="email" className={`t-input ${errors.email ? 'error' : ''}`}
                                    placeholder="your@email.com" value={data.email}
                                    onChange={e => onChange('email', e.target.value)} />
                            </div>
                            {apiError && <div style={{ marginBottom: 16, color: 'var(--t-danger-tx)', fontSize: '0.82rem' }}>{apiError}</div>}
                            <button onClick={submit} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                                {loading ? 'Finding profile...' : 'Sign In'}
                                {!loading && <Icon name="arrow" size={15} />}
                            </button>
                        </div>
                    ) : (
                        <>
                            {step === 1 && <StepAccount data={data} onChange={onChange} errors={errors} />}
                            {step === 2 && <StepProfile data={data} onChange={onChange} errors={errors} />}
                            {step === 3 && <StepPreferences data={data} onChange={onChange} errors={errors} />}

                            {apiError && (
                                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--t-danger-bg)', border: '1px solid var(--t-danger-bd)', color: 'var(--t-danger-tx)', fontSize: '0.83rem', marginTop: 16 }}>
                                    {apiError}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                                {step > 1 && (
                                    <button onClick={prev} className="btn-ghost">
                                        <Icon name="arrow-left" size={15} /> Back
                                    </button>
                                )}
                                {step < 3 ? (
                                    <button onClick={next} className="btn-primary" style={{ flex: 1 }}>
                                        Continue <Icon name="arrow" size={15} />
                                    </button>
                                ) : (
                                    <button onClick={submit} disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                                        {loading ? 'Creating profile...' : 'Create Profile'}
                                        {!loading && <Icon name="arrow" size={15} />}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Switcher */}
                {!submitted && (
                    <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.78rem', color: 'var(--t-text-3)' }}>
                        {isLogin ? "New to AdaptIQ?" : "Already registered?"}{' '}
                        <button onClick={() => { setIsLogin(!isLogin); setApiError(''); setErrors({}) }}
                            style={{ color: 'var(--t-accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.78rem' }}>
                            {isLogin ? "Create a Profile" : "Sign in with email"}
                        </button>
                    </p>
                )}
            </div>
        </div>
    )
}
