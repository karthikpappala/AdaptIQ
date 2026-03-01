export default function RadioCard({ icon, title, subtitle, selected, onClick, compact }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative p-4 ${compact ? 'max-[480px]:p-3' : ''} rounded-xl bg-glass-bg border-[1.5px] cursor-pointer transition-all duration-300 text-center hover:bg-glass-hover hover:border-[rgba(167,139,250,0.2)] w-full ${selected
                    ? 'border-accent-600 bg-accent-600/[0.12] shadow-[0_0_16px_rgba(124,58,237,0.1)]'
                    : 'border-glass-border'
                }`}
        >
            <div className={`${compact ? 'text-[1.6rem] max-[480px]:text-[1.15rem]' : 'text-2xl max-[480px]:text-xl'} mb-1.5 ${compact ? 'max-[480px]:mb-1' : ''}`}>{icon}</div>
            <div className={`${compact ? 'text-[0.85rem] max-[480px]:text-[0.75rem]' : 'text-[0.85rem] max-[480px]:text-[0.78rem]'} font-semibold text-[#f1f0ff] mb-0.5`}>{title}</div>
            {subtitle && <div className="text-[0.72rem] text-[#6b6991]">{subtitle}</div>}
        </button>
    )
}
