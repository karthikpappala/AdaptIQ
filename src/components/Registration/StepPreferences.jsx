import { useState } from 'react'
import Icon from '../ui/Icon'

// Dynamic use cases / topics based on role category
const getRoleCategory = (role) => {
    if (['Software Developer', 'Data Scientist', 'UI/UX Designer', 'DevOps Engineer', 'Cybersecurity Analyst'].includes(role))
        return 'tech'
    if (['Medical Doctor', 'Nurse / Healthcare Worker', 'Pharmacist', 'Psychologist / Therapist', 'Dentist'].includes(role))
        return 'health'
    if (['Entrepreneur / Founder', 'Business Analyst', 'Marketing Specialist', 'Sales Professional', 'Accountant / Finance'].includes(role))
        return 'business'
    if (['Student', 'Teacher / Professor', 'Researcher', 'Academic Tutor'].includes(role))
        return 'education'
    if (['Content Creator / Writer', 'Graphic Designer', 'Artist / Illustrator', 'Photographer / Videographer'].includes(role))
        return 'creative'
    if (['Lawyer / Legal Professional', 'Government Officer', 'Social Worker', 'Military / Defense'].includes(role))
        return 'legal'
    return 'general'
}

const useCasesByCategory = {
    tech: [{ value: 'Coding & Development', sub: 'Build, debug and design systems' }, { value: 'Research & Analysis', sub: 'Technical research and deep dives' }, { value: 'Career Growth', sub: 'Interview prep and levelling up' }, { value: 'Learning & Education', sub: 'New frameworks and concepts' }],
    health: [{ value: 'Medical Knowledge', sub: 'Clinical topics and pharmacology' }, { value: 'Research & Analysis', sub: 'Evidence-based medical research' }, { value: 'Patient Communication', sub: 'Explain complex conditions clearly' }, { value: 'Professional Development', sub: 'Career advancement in healthcare' }],
    business: [{ value: 'Business Strategy', sub: 'Market analysis and planning' }, { value: 'Marketing & Growth', sub: 'Customer acquisition and retention' }, { value: 'Financial Literacy', sub: 'Budgets, funding and forecasts' }, { value: 'Leadership & Management', sub: 'Team building and operations' }],
    education: [{ value: 'Learning & Education', sub: 'Concepts, summaries and notes' }, { value: 'Research & Analysis', sub: 'Writing and literature reviews' }, { value: 'Career Guidance', sub: 'Placements, applications and plans' }, { value: 'Exam Preparation', sub: 'Practice questions and strategy' }],
    creative: [{ value: 'Writing & Content', sub: 'Drafts, scripts and storytelling' }, { value: 'Creative Direction', sub: 'Design, aesthetics and concepts' }, { value: 'Audience Building', sub: 'Grow your platform and presence' }, { value: 'Personal Branding', sub: 'Positioning and online identity' }],
    legal: [{ value: 'Legal Research', sub: 'Case law and statutes' }, { value: 'Professional Writing', sub: 'Reports, briefs and documentation' }, { value: 'Policy & Compliance', sub: 'Regulations and governance' }, { value: 'Career Development', sub: 'Skills and advancement' }],
    general: [{ value: 'Learning & Education', sub: 'Skill building and knowledge' }, { value: 'Career Guidance', sub: 'Professional development' }, { value: 'Research & Analysis', sub: 'Deep research and insights' }, { value: 'Personal Development', sub: 'Self-improvement and growth' }],
}

const topicsByCategory = {
    tech: ['Data Structures', 'System Design', 'Web Development', 'Machine Learning', 'Cloud & DevOps', 'Cybersecurity', 'API Design', 'Open Source'],
    health: ['Clinical Medicine', 'Pharmacology', 'Medical Research', 'Patient Care', 'Diagnostics', 'Mental Health', 'Public Health', 'Medical Ethics'],
    business: ['Business Strategy', 'Marketing', 'Finance & Accounting', 'Product Management', 'Leadership', 'Operations', 'Sales', 'E-commerce'],
    education: ['Study Techniques', 'Academic Writing', 'Exam Strategy', 'Research Methods', 'Time Management', 'Critical Thinking', 'STEM', 'Humanities'],
    creative: ['Content Writing', 'Graphic Design', 'Photography', 'Video Production', 'Social Media', 'Brand Identity', 'Storytelling', 'Illustration'],
    legal: ['Constitutional Law', 'Criminal Law', 'Civil Litigation', 'Property Law', 'Corporate Law', 'International Law', 'Legal Writing', 'Ethics'],
    general: ['Professional Development', 'Communication', 'Problem Solving', 'Time Management', 'Leadership', 'Critical Thinking', 'Research', 'Wellness'],
}

const explanationStyles = [
    { value: 'Concise', sub: 'Short and direct', icon: 'zap' },
    { value: 'Detailed', sub: 'In-depth explanations', icon: 'book' },
    { value: 'Step-by-step', sub: 'Sequential guidance', icon: 'bar-chart' },
    { value: 'Conversational', sub: 'Friendly and natural', icon: 'message' },
]

export default function StepPreferences({ data, onChange, errors }) {
    const [uploadChoice, setUploadChoice] = useState(null) // null | 'yes' | 'no'
    const cat = getRoleCategory(data.role || '')
    const useCases = useCasesByCategory[cat] || useCasesByCategory.general
    const topics = topicsByCategory[cat] || topicsByCategory.general

    const toggleTopic = (val) => {
        const current = data.topics || []
        onChange('topics', current.includes(val) ? current.filter(t => t !== val) : [...current, val])
    }

    return (
        <div className="animate-fade-slide">
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.1rem,3vw,1.3rem)', fontWeight: 700, color: 'var(--t-text)', marginBottom: 4 }}>
                AI Preferences
            </h2>
            <p style={{ color: 'var(--t-text-2)', fontSize: '0.85rem', marginBottom: 28 }}>
                Customize how AdaptIQ responds to you
            </p>

            {/* Choice Step */}
            {uploadChoice === null && (
                <div style={{ padding: 24, borderRadius: 16, background: 'var(--t-surface-2)', border: '1px solid var(--t-border-2)', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-accent)', flexShrink: 0 }}>
                            <Icon name="upload" size={18} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--t-text)', marginBottom: 4 }}>Import AI History</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--t-text-2)', lineHeight: 1.6 }}>
                                Would you like to import your ChatGPT or Gemini data for instant, deep personalization?
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button type="button" onClick={() => { setUploadChoice('yes'); onChange('wantsUpload', true) }}
                            style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--t-accent)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(58,122,181,0.25)' }}>
                            Yes, import data
                        </button>
                        <button type="button" onClick={() => { setUploadChoice('no'); onChange('wantsUpload', false) }}
                            style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--t-input-bg)', color: 'var(--t-text-2)', border: '1px solid var(--t-border-2)', fontWeight: 500, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                            No, set manually
                        </button>
                    </div>
                </div>
            )}

            {/* Agreed to upload: Show Instructions */}
            {uploadChoice === 'yes' && (
                <div className="animate-fade-slide">
                    <div style={{ padding: 14, borderRadius: 12, background: 'var(--t-accent-bg)', border: '1px solid var(--t-border-accent)', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                        <Icon name="info" size={16} style={{ color: 'var(--t-accent)' }} />
                        <div style={{ fontSize: '0.78rem', color: 'var(--t-text-2)' }}>
                            Providing <strong>at least one</strong> (ChatGPT or Gemini) is enough for great results.
                        </div>
                        <button type="button" onClick={() => { setUploadChoice(null); onChange('wantsUpload', false) }}
                            style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--t-accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                            Change
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* ChatGPT */}
                        <div className="glass-card" style={{ background: 'var(--t-surface-2)', padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#10a37f22', border: '1px solid #10a37f44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10a37f' }}>
                                    <Icon name="message" size={14} />
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--t-text)' }}>ChatGPT Export Steps</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    'Open Settings (bottom-left profile icon)',
                                    'Navigate to the Data Controls tab',
                                    'Find "Export data" and click Export',
                                    'Confirm export (Check your email for the link)',
                                ].map((step, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: '0.8rem', color: 'var(--t-text-2)', lineHeight: 1.4 }}>
                                        <div style={{ fontWeight: 700, color: 'var(--t-accent)', opacity: 0.6 }}>0{i + 1}</div>
                                        {step}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Gemini */}
                        <div className="glass-card" style={{ background: 'var(--t-surface-2)', padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#4285f422', border: '1px solid #4285f444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4285f4' }}>
                                    <Icon name="brain" size={14} />
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--t-text)' }}>Gemini Export Steps</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    'Go to Google Takeout (takeout.google.com)',
                                    'Deselect all and only select "Gemini"',
                                    'Click "Next step" and "Create export"',
                                    'Download the result once ready',
                                ].map((step, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: '0.8rem', color: 'var(--t-text-2)', lineHeight: 1.4 }}>
                                        <div style={{ fontWeight: 700, color: 'var(--t-accent)', opacity: 0.6 }}>0{i + 1}</div>
                                        {step}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 20, textAlign: 'center', padding: '10px 14px', borderRadius: 12, background: 'var(--t-surface-2)', border: '1px solid var(--t-border)' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--t-text)' }}>Ready to proceed?</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--t-text-3)', marginTop: 2 }}>You can upload these files on the next step or from your dashboard.</div>
                    </div>
                </div>
            )}

            {/* Disagreed to upload: Show Manual Options */}
            {uploadChoice === 'no' && (
                <div className="animate-fade-slide">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                        <button type="button" onClick={() => { setUploadChoice(null); onChange('wantsUpload', false) }}
                            style={{ fontSize: '0.72rem', color: 'var(--t-accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                            Switch to Data Import
                        </button>
                    </div>

                    <div className="mb-5">
                        <label className="field-label">Explanation Style <span style={{ color: 'var(--t-danger-tx)' }}>*</span></label>
                        {errors.responseStyle && <div style={{ color: 'var(--t-danger-tx)', fontSize: '0.75rem', marginBottom: 6 }}>{errors.responseStyle}</div>}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                            {explanationStyles.map(s => (
                                <button key={s.value} type="button" onClick={() => onChange('responseStyle', s.value)}
                                    style={{
                                        padding: '12px 10px', borderRadius: 12,
                                        border: `1.5px solid ${data.responseStyle === s.value ? 'var(--t-accent)' : 'var(--t-border)'}`,
                                        background: data.responseStyle === s.value ? 'var(--t-accent-bg)' : 'var(--t-input-bg)',
                                        color: data.responseStyle === s.value ? 'var(--t-accent)' : 'var(--t-text-2)',
                                        cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'center',
                                    }}>
                                    <Icon name={s.icon} size={15} />
                                    <div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.value}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--t-text-3)' }}>{s.sub}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="field-label">Primary Use Case <span style={{ color: 'var(--t-danger-tx)' }}>*</span></label>
                        {errors.useCase && <div style={{ color: 'var(--t-danger-tx)', fontSize: '0.75rem', marginBottom: 6 }}>{errors.useCase}</div>}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                            {useCases.map(u => (
                                <button key={u.value} type="button" onClick={() => onChange('useCase', u.value)}
                                    style={{
                                        padding: '12px 10px', borderRadius: 12,
                                        border: `1.5px solid ${data.useCase === u.value ? 'var(--t-accent)' : 'var(--t-border)'}`,
                                        background: data.useCase === u.value ? 'var(--t-accent-bg)' : 'var(--t-input-bg)',
                                        color: data.useCase === u.value ? 'var(--t-accent)' : 'var(--t-text-2)',
                                        cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                                    }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{u.value}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--t-text-3)', marginTop: 2 }}>{u.sub}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="field-label">Topics of Interest</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                            {topics.map(t => {
                                const sel = (data.topics || []).includes(t)
                                return (
                                    <button key={t} type="button" onClick={() => toggleTopic(t)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 9999, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s',
                                            border: `1.5px solid ${sel ? 'var(--t-accent)' : 'var(--t-border-2)'}`,
                                            background: sel ? 'var(--t-accent-bg)' : 'var(--t-input-bg)',
                                            color: sel ? 'var(--t-accent)' : 'var(--t-text-2)',
                                            fontWeight: sel ? 500 : 400,
                                        }}>
                                        {t}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="field-label">Custom Instructions <span style={{ color: 'var(--t-text-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                        <textarea id="customPrompt"
                            placeholder="e.g. Always use real-world examples, avoid jargon, focus on practical applications"
                            value={data.customPrompt || ''}
                            onChange={e => onChange('customPrompt', e.target.value)}
                            className="t-input"
                            style={{ resize: 'vertical', minHeight: 80, lineHeight: 1.5 }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
