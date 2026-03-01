export default function Chip({ icon, label, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 py-2.5 px-5 rounded-full border-[1.5px] text-[0.84rem] font-medium cursor-pointer transition-all duration-300 select-none ${selected
                    ? 'bg-accent-600/[0.18] border-accent-600 text-accent-500'
                    : 'bg-glass-bg border-glass-border text-[#a5a3c7] hover:bg-glass-hover hover:border-[rgba(167,139,250,0.3)]'
                }`}
        >
            <span>{icon}</span> {label}
        </button>
    )
}
