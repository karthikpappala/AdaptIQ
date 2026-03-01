import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        primaryColor: '#3a7ab5',
        primaryTextColor: '#fff',
        primaryBorderColor: '#3a7ab5',
        lineColor: '#6c7a89',
        secondaryColor: '#ebf2f8',
        tertiaryColor: '#f8fafc',
    },
    securityLevel: 'loose',
})

export default function MermaidGraph({ chart }) {
    const containerRef = useRef(null)
    const [svg, setSvg] = useState('')
    const [error, setError] = useState(false)

    useEffect(() => {
        let isMounted = true

        const renderChart = async () => {
            if (!chart) return
            try {
                // Ensure unique ID for this render
                const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`
                const { svg: svgResult } = await mermaid.render(id, chart)
                if (isMounted) {
                    setSvg(svgResult)
                    setError(false)
                }
            } catch (err) {
                console.error("Mermaid parsing error", err)
                if (isMounted) setError(true)
            }
        }

        renderChart()

        return () => {
            isMounted = false
        }
    }, [chart])

    if (error) {
        return (
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--t-danger-bg)', color: 'var(--t-danger-tx)', fontSize: '0.8rem', border: '1px solid var(--t-danger-bd)' }}>
                Failed to render diagram. Code might be invalid.
            </div>
        )
    }

    if (!svg) {
        return <div style={{ padding: 20, textAlign: 'center', color: 'var(--t-text-3)', fontSize: '0.8rem' }}>Generating Visualization...</div>
    }

    return (
        <div
            ref={containerRef}
            dangerouslySetInnerHTML={{ __html: svg }}
            style={{
                width: '100%',
                overflowX: 'auto',
                display: 'flex',
                justifyContent: 'center',
                padding: '16px 0',
                margin: '12px 0',
                background: 'var(--t-surface-2)',
                borderRadius: 12,
                border: '1px solid var(--t-border)'
            }}
        />
    )
}
