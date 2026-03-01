import Icon from '../ui/Icon'

// All roles grouped by domain — no emoji, use Icon component
const roleGroups = [
    {
        group: 'Technology',
        icon: 'code',
        roles: ['Software Developer', 'Data Scientist', 'UI/UX Designer', 'DevOps Engineer', 'Cybersecurity Analyst'],
    },
    {
        group: 'Healthcare',
        icon: 'heart',
        roles: ['Medical Doctor', 'Nurse / Healthcare Worker', 'Pharmacist', 'Psychologist / Therapist', 'Dentist'],
    },
    {
        group: 'Business',
        icon: 'briefcase',
        roles: ['Entrepreneur / Founder', 'Business Analyst', 'Marketing Specialist', 'Sales Professional', 'Accountant / Finance'],
    },
    {
        group: 'Education',
        icon: 'grad-cap',
        roles: ['Student', 'Teacher / Professor', 'Researcher', 'Academic Tutor'],
    },
    {
        group: 'Creative',
        icon: 'pen',
        roles: ['Content Creator / Writer', 'Graphic Designer', 'Artist / Illustrator', 'Photographer / Videographer'],
    },
    {
        group: 'Law & Public Service',
        icon: 'scale',
        roles: ['Lawyer / Legal Professional', 'Government Officer', 'Social Worker', 'Military / Defense'],
    },
    {
        group: 'Other',
        icon: 'user',
        roles: ['Freelancer / Consultant', 'Homemaker', 'Farmer / Agriculture', 'Retired Professional', 'Other'],
    },
]

const industries = [
    'Technology', 'Healthcare & Medicine', 'Finance & Banking', 'Education',
    'Media & Entertainment', 'Government & Public Sector', 'Agriculture',
    'Legal & Compliance', 'Non-profit / NGO', 'Real Estate', 'Retail & Commerce', 'Other',
]

const experienceLevels = [
    { value: 'Beginner', icon: 'zap', sub: 'Just starting out' },
    { value: 'Intermediate', icon: 'bar-chart', sub: 'Some experience' },
    { value: 'Advanced', icon: 'trending-up', sub: 'Highly capable' },
    { value: 'Expert', icon: 'shield', sub: 'Industry veteran' },
]

export default function StepProfile({ data, onChange, errors }) {
    const allRoles = roleGroups.flatMap(g => g.roles)

    return (
        <div className="animate-fade-slide">
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.1rem,3vw,1.3rem)', fontWeight: 700, color: 'var(--t-text)', marginBottom: 4 }}>
                Professional Profile
            </h2>
            <p style={{ color: 'var(--t-text-2)', fontSize: '0.85rem', marginBottom: 28 }}>
                Tell us about your background so we can personalize everything
            </p>

            {/* Role selector — grouped */}
            <div className="mb-5">
                <label className="field-label">Your Role / Occupation <span style={{ color: 'var(--t-danger-tx)' }}>*</span></label>
                {errors.role && <div style={{ color: 'var(--t-danger-tx)', fontSize: '0.75rem', marginBottom: 6 }}>{errors.role}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {roleGroups.map(grp => (
                        <div key={grp.group}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--t-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, marginTop: 6 }}>
                                <Icon name={grp.icon} size={12} />
                                {grp.group}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {grp.roles.map(role => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => onChange('role', role)}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: 9999,
                                            border: `1.5px solid ${data.role === role ? 'var(--t-accent)' : 'var(--t-border-2)'}`,
                                            background: data.role === role ? 'var(--t-accent-bg)' : 'var(--t-input-bg)',
                                            color: data.role === role ? 'var(--t-accent)' : 'var(--t-text-2)',
                                            fontSize: '0.8rem',
                                            fontWeight: data.role === role ? 600 : 400,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Experience Level */}
            <div className="mb-5">
                <label className="field-label">Experience Level <span style={{ color: 'var(--t-danger-tx)' }}>*</span></label>
                {errors.experience && <div style={{ color: 'var(--t-danger-tx)', fontSize: '0.75rem', marginBottom: 6 }}>{errors.experience}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {experienceLevels.map(lv => (
                        <button
                            key={lv.value}
                            type="button"
                            onClick={() => onChange('experience', lv.value)}
                            style={{
                                padding: '14px 12px',
                                borderRadius: 12,
                                border: `1.5px solid ${data.experience === lv.value ? 'var(--t-accent)' : 'var(--t-border)'}`,
                                background: data.experience === lv.value ? 'var(--t-accent-bg)' : 'var(--t-input-bg)',
                                color: data.experience === lv.value ? 'var(--t-accent)' : 'var(--t-text-2)',
                                cursor: 'pointer',
                                transition: 'all 0.18s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <Icon name={lv.icon} size={18} />
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lv.value}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--t-text-3)' }}>{lv.sub}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
