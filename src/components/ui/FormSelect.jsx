export default function FormSelect({ label, id, error, required, children, ...props }) {
    return (
        <div className="mb-5">
            {label && (
                <label htmlFor={id} className="block text-[0.78rem] font-semibold text-[#a5a3c7] mb-1.5 uppercase tracking-wider">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <select
                id={id}
                className={`w-full px-4 py-3 bg-white/[0.03] border-[1.5px] border-glass-border rounded-xl text-[#f1f0ff] text-[0.9rem] font-body outline-none transition-all duration-300 focus:border-accent-600 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] appearance-none bg-no-repeat bg-[right_14px_center] pr-10 cursor-pointer ${error ? '!border-red-400' : ''}`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b6991' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 4 3.5-4z'/%3E%3C/svg%3E")` }}
                {...props}
            >
                {children}
            </select>
            {error && <div className="text-[0.75rem] text-red-400 mt-1">{error}</div>}
        </div>
    )
}
