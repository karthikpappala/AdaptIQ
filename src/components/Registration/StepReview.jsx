export default function StepReview({ data }) {
    const SummaryItem = ({ label, value, full }) => (
        <div className={`p-3 bg-white/[0.02] border border-glass-border rounded-lg ${full ? 'col-span-full' : ''}`}>
            <div className="text-[0.68rem] uppercase tracking-wider text-[#6b6991] mb-0.5">{label}</div>
            <div className="text-[0.87rem] font-medium text-[#f1f0ff] break-words">{value}</div>
        </div>
    )

    return (
        <div className="animate-fade-slide">
            <h2 className="font-heading text-[clamp(1.1rem,3vw,1.35rem)] font-semibold mb-1">Review Your Profile</h2>
            <p className="text-[0.85rem] text-[#a5a3c7] mb-7">Make sure everything looks right before submitting</p>

            <div className="mb-5">
                <h3 className="font-heading text-[0.85rem] font-semibold text-accent-500 uppercase tracking-wider mb-2.5 flex items-center gap-2"><span>👤</span> Account</h3>
                <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-2">
                    <SummaryItem label="Name" value={`${data.firstName} ${data.lastName}`} />
                    <SummaryItem label="Email" value={data.email} />
                </div>
            </div>

            <div className="mb-5">
                <h3 className="font-heading text-[0.85rem] font-semibold text-accent-500 uppercase tracking-wider mb-2.5 flex items-center gap-2"><span>💼</span> Professional</h3>
                <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-2">
                    <SummaryItem label="Role" value={data.role} />
                    <SummaryItem label="Experience" value={data.experience} />
                    {data.industry && <SummaryItem label="Industry" value={data.industry} full />}
                </div>
            </div>

            <div className="mb-5">
                <h3 className="font-heading text-[0.85rem] font-semibold text-accent-500 uppercase tracking-wider mb-2.5 flex items-center gap-2"><span>🤖</span> AI Preferences</h3>
                <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-2">
                    <SummaryItem label="Response Style" value={data.responseStyle} />
                    <SummaryItem label="Use Case" value={data.useCase} />
                    {data.topics?.length > 0 && (
                        <div className="col-span-full p-3 bg-white/[0.02] border border-glass-border rounded-lg">
                            <div className="text-[0.68rem] uppercase tracking-wider text-[#6b6991] mb-1">Topics</div>
                            <div className="flex flex-wrap gap-1.5">
                                {data.topics.map(t => (
                                    <span key={t} className="inline-block py-1 px-3 rounded-full bg-accent-600/[0.12] border border-accent-600/25 text-accent-400 text-[0.75rem] font-medium">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.customPrompt && <SummaryItem label="Custom Instructions" value={data.customPrompt} full />}
                </div>
            </div>
        </div>
    )
}
