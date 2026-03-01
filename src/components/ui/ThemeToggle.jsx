import { useTheme } from '../../context/ThemeContext'
import Icon from './Icon'

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme()
    return (
        <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
            className={className}
            style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: 'var(--t-accent-bg)',
                border: '1.5px solid var(--t-border-2)',
                color: 'var(--t-text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--t-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t-text-2)'}
        >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
        </button>
    )
}
