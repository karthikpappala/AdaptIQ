import Icon from '../ui/Icon'
import { useRef } from 'react'

export default function StepAccount({ data, onChange, errors }) {
    const fileRef = useRef(null)

    const handleFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => onChange('profilePic', reader.result)
        reader.readAsDataURL(file)
    }

    return (
        <div className="animate-fade-slide">
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.1rem,3vw,1.3rem)', fontWeight: 700, color: 'var(--t-text)', marginBottom: 4 }}>
                Account Details
            </h2>
            <p style={{ color: 'var(--t-text-2)', fontSize: '0.85rem', marginBottom: 28 }}>
                Your identity — used to restore your profile on return visits
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <button
                    onClick={() => fileRef.current?.click()}
                    title="Upload profile picture"
                    style={{
                        width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--t-surface-2)', border: '2px dashed var(--t-border-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--t-accent)', cursor: 'pointer', overflow: 'hidden',
                        padding: 0, position: 'relative'
                    }}
                >
                    {data.profilePic ? (
                        <img src={data.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <Icon name="camera" size={20} />
                    )}
                </button>
                <input type="file" ref={fileRef} hidden onChange={handleFile} accept="image/*" />
                <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--t-text)' }}>Profile Picture</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--t-text-3)' }}>Optional. Choose an image to personalize your dashboard.</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="max-[520px]:!grid-cols-1">
                <div>
                    <label className="field-label" htmlFor="firstName">First Name <span style={{ color: 'var(--t-danger-tx)' }}>*</span></label>
                    {errors.firstName && <div style={{ color: 'var(--t-danger-tx)', fontSize: '0.72rem', marginBottom: 4 }}>{errors.firstName}</div>}
                    <input id="firstName" className={`t-input ${errors.firstName ? 'error' : ''}`}
                        placeholder="Your first name" value={data.firstName}
                        onChange={e => onChange('firstName', e.target.value)} />
                </div>
                <div>
                    <label className="field-label" htmlFor="lastName">Last Name <span style={{ color: 'var(--t-danger-tx)' }}>*</span></label>
                    {errors.lastName && <div style={{ color: 'var(--t-danger-tx)', fontSize: '0.72rem', marginBottom: 4 }}>{errors.lastName}</div>}
                    <input id="lastName" className={`t-input ${errors.lastName ? 'error' : ''}`}
                        placeholder="Your last name" value={data.lastName}
                        onChange={e => onChange('lastName', e.target.value)} />
                </div>
            </div>

            <div style={{ marginBottom: 20 }}>
                <label className="field-label" htmlFor="email">Email Address <span style={{ color: 'var(--t-danger-tx)' }}>*</span></label>
                {errors.email && <div style={{ color: 'var(--t-danger-tx)', fontSize: '0.72rem', marginBottom: 4 }}>{errors.email}</div>}
                <input id="email" type="email" className={`t-input ${errors.email ? 'error' : ''}`}
                    placeholder="your@email.com" value={data.email}
                    onChange={e => onChange('email', e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 12, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)' }}>
                <Icon name="info" size={16} style={{ color: 'var(--t-accent)', flexShrink: 0, marginTop: 1 }} />
                <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--t-accent)', marginBottom: 3 }}>No password required</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--t-text-2)', lineHeight: 1.5 }}>
                        Enter the same email next time to restore your full learning profile, progress, and personalization settings.
                    </div>
                </div>
            </div>
        </div>
    )
}
