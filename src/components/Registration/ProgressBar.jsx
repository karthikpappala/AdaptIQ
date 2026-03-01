export default function ProgressBar({ currentStep, totalSteps = 4 }) {
    const steps = [
        { label: 'Account', num: 1 },
        { label: 'Profile', num: 2 },
        { label: 'Preferences', num: 3 },
        { label: 'Review', num: 4 },
    ]

    return (
        <div className="flex items-center justify-center mb-8 px-2">
            <div className="flex items-center">
                {steps.map((step, i) => (
                    <div key={step.num} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[0.8rem] font-semibold relative z-[2] transition-all duration-300 border-2 ${step.num === currentStep
                                    ? 'bg-gradient-to-br from-accent-600 via-accent-700 to-accent-800 border-accent-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.35)]'
                                    : step.num < currentStep
                                        ? 'bg-emerald-400 border-emerald-400 text-white'
                                        : 'bg-glass-bg border-glass-border text-[#6b6991]'
                                }`}>
                                {step.num < currentStep ? '✓' : step.num}
                            </div>
                            <span className={`mt-2 text-[0.7rem] font-medium uppercase tracking-wider whitespace-nowrap transition-all duration-300 max-[480px]:hidden ${step.num === currentStep ? 'text-accent-500' :
                                    step.num < currentStep ? 'text-emerald-400' : 'text-[#6b6991]'
                                }`}>{step.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`w-[clamp(24px,8vw,60px)] h-0.5 mx-1 mb-6 max-[480px]:mb-0 transition-all duration-300 ${step.num < currentStep
                                    ? 'bg-gradient-to-r from-accent-500 to-accent-600'
                                    : 'bg-glass-border'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
