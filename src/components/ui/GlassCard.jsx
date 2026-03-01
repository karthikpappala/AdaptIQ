export default function GlassCard({ children, className = '' }) {
    return (
        <div className={`glass-card rounded-[clamp(16px,3vw,24px)] p-[clamp(20px,4vw,36px)] ${className}`}>
            {children}
        </div>
    )
}
