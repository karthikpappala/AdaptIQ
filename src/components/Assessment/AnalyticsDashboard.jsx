export default function AnalyticsDashboard({ signals, visible, onClose }) {
    const SignalBar = ({ icon, label, value, barId, barColor, pct }) => (
        <div className="p-3 rounded-xl bg-glass-bg border border-glass-border">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[0.75rem] text-[#a5a3c7] font-medium">{icon} {label}</span>
                <span className="text-[0.72rem] text-accent-400 font-semibold">{value}</span>
            </div>
            <div className="w-full h-1.5 bg-dark-900 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} />
            </div>
        </div>
    )

    const StateCard = ({ emoji, label, score, state }) => {
        const highlight = score >= 50
        const colors = {
            confused: highlight ? 'bg-yellow-500/[0.15] border-yellow-500' : '',
            overwhelmed: highlight ? 'bg-red-500/[0.15] border-red-500' : '',
            engaged: highlight ? 'bg-emerald-500/[0.15] border-emerald-500' : '',
            bored: highlight ? 'bg-accent-600/[0.15] border-accent-600' : '',
        }
        return (
            <div className={`p-3 rounded-xl bg-glass-bg border border-glass-border text-center transition-all duration-300 ${colors[state] || ''}`}>
                <div className="text-xl mb-1">{emoji}</div>
                <div className="text-[0.72rem] font-semibold text-[#6b6991]">{label}</div>
                <div className="text-[0.9rem] font-bold text-[#f1f0ff] mt-1">{Math.round(score)}%</div>
            </div>
        )
    }

    return (
        <div className={`fixed top-0 right-0 w-[clamp(320px,30vw,420px)] h-full z-50 bg-dark-800/95 backdrop-blur-xl border-l border-glass-border overflow-y-auto shadow-[-8px_0_40px_rgba(0,0,0,0.5)] transition-all duration-400 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
            {/* Header */}
            <div className="sticky top-0 bg-dark-800/90 backdrop-blur-md border-b border-glass-border px-5 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="live-dot" />
                    <h3 className="font-heading text-[0.95rem] font-semibold text-accent-400">Behavioral Signals</h3>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-glass-bg border border-glass-border flex items-center justify-center text-[#6b6991] hover:text-[#f1f0ff] hover:bg-glass-hover transition-all cursor-pointer text-sm">✕</button>
            </div>

            {/* Inferred State */}
            <div className="px-5 py-4 border-b border-glass-border">
                <p className="text-[0.7rem] uppercase tracking-wider text-[#6b6991] mb-3 font-semibold">Inferred User State</p>
                <div className="grid grid-cols-2 gap-2">
                    <StateCard emoji="😵" label="Confused" score={signals.states.confused} state="confused" />
                    <StateCard emoji="😰" label="Overwhelmed" score={signals.states.overwhelmed} state="overwhelmed" />
                    <StateCard emoji="🔥" label="Engaged" score={signals.states.engaged} state="engaged" />
                    <StateCard emoji="😴" label="Bored" score={signals.states.bored} state="bored" />
                </div>
            </div>

            {/* Raw Signals */}
            <div className="px-5 py-4">
                <p className="text-[0.7rem] uppercase tracking-wider text-[#6b6991] mb-3 font-semibold">Raw Behavioral Signals</p>
                <div className="space-y-3">
                    <SignalBar icon="⏱" label="Time per Section" value={`${signals.avgSectionTime}s avg`}
                        barColor="bg-gradient-to-r from-accent-600 to-accent-500" pct={signals.avgSectionTime / 120 * 100} />
                    <SignalBar icon="📜" label="Scroll Depth" value={`${signals.scrollMax}%`}
                        barColor="bg-gradient-to-r from-blue-500 to-cyan-400" pct={signals.scrollMax} />
                    <SignalBar icon="🔄" label="Field Re-visits" value={signals.totalRevisits.toString()}
                        barColor="bg-gradient-to-r from-amber-500 to-yellow-400" pct={signals.totalRevisits / 10 * 100} />
                    <SignalBar icon="🔀" label="Answer Changes" value={signals.answerChanges.toString()}
                        barColor="bg-gradient-to-r from-orange-500 to-red-400" pct={signals.answerChanges / 8 * 100} />
                    <SignalBar icon="⚡" label="Avg Answer Speed" value={signals.avgSpeed ? `${signals.avgSpeed}s` : '—'}
                        barColor="bg-gradient-to-r from-emerald-500 to-green-400" pct={signals.avgSpeed ? signals.avgSpeed / 30 * 100 : 0} />
                    <SignalBar icon="🚪" label="Sections Abandoned" value={`${signals.abandoned} / 2`}
                        barColor="bg-gradient-to-r from-rose-500 to-pink-400" pct={signals.abandoned / 2 * 100} />
                    <div className="p-3 rounded-xl bg-glass-bg border border-glass-border">
                        <div className="flex items-center justify-between">
                            <span className="text-[0.75rem] text-[#a5a3c7] font-medium">🌙 Usage Pattern</span>
                            <span className="text-[0.72rem] text-accent-400 font-semibold">{signals.usagePattern}</span>
                        </div>
                    </div>
                </div>

                {/* Session Info */}
                <div className="mt-4 p-3 rounded-xl bg-accent-600/10 border border-accent-600/20">
                    <p className="text-[0.7rem] uppercase tracking-wider text-accent-400 mb-2 font-semibold">Session</p>
                    <div className="flex justify-between text-[0.75rem]">
                        <span className="text-[#6b6991]">Started</span>
                        <span className="text-[#a5a3c7] font-medium">{signals.sessionStart}</span>
                    </div>
                    <div className="flex justify-between text-[0.75rem] mt-1">
                        <span className="text-[#6b6991]">Duration</span>
                        <span className="text-[#a5a3c7] font-medium">{signals.sessionDuration}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
