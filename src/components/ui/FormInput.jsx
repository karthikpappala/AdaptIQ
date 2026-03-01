const baseInput = "w-full px-4 py-3 bg-white/[0.03] border-[1.5px] border-glass-border rounded-xl text-[#f1f0ff] text-[0.9rem] font-body outline-none transition-all duration-300 focus:border-accent-600 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] focus:bg-white/[0.05]"

export default function FormInput({ label, id, error, required, type = 'text', ...props }) {
    return (
        <div className="mb-5">
            {label && (
                <label htmlFor={id} className="block text-[0.78rem] font-semibold text-[#a5a3c7] mb-1.5 uppercase tracking-wider">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <input
                type={type}
                id={id}
                className={`${baseInput} ${error ? '!border-red-400 !shadow-[0_0_0_3px_rgba(248,113,113,0.12)]' : ''}`}
                {...props}
            />
            {error && <div className="text-[0.75rem] text-red-400 mt-1">{error}</div>}
        </div>
    )
}
