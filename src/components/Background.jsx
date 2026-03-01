// Background blobs — navy/sapphire monochrome, subtle and professional
export default function Background() {
    return (
        <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute', borderRadius: '50%',
                    width: 'clamp(280px, 42vw, 560px)', height: 'clamp(280px, 42vw, 560px)',
                    top: '-12%', right: '-6%',
                    background: 'radial-gradient(circle, rgba(36,80,148,0.3) 0%, transparent 70%)',
                    filter: 'blur(90px)', opacity: 0.7,
                    animation: 'blobFloat 20s ease-in-out infinite alternate',
                }} />
                <div style={{
                    position: 'absolute', borderRadius: '50%',
                    width: 'clamp(220px, 36vw, 440px)', height: 'clamp(220px, 36vw, 440px)',
                    bottom: '-8%', left: '-4%',
                    background: 'radial-gradient(circle, rgba(18,55,110,0.28) 0%, transparent 70%)',
                    filter: 'blur(90px)', opacity: 0.6,
                    animation: 'blobFloat 20s ease-in-out -6s infinite alternate',
                }} />
                <div style={{
                    position: 'absolute', borderRadius: '50%',
                    width: 'clamp(160px, 28vw, 340px)', height: 'clamp(160px, 28vw, 340px)',
                    top: '42%', left: '48%',
                    background: 'radial-gradient(circle, rgba(58,122,181,0.16) 0%, transparent 70%)',
                    filter: 'blur(80px)', opacity: 0.5,
                    animation: 'blobFloat 20s ease-in-out -12s infinite alternate',
                }} />
            </div>
            <style>{`
        [data-theme="light"] .bg-blob { opacity: 0.25 !important; }
      `}</style>
        </>
    )
}
