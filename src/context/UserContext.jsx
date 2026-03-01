import { createContext, useContext, useState, useEffect } from 'react'
import { userApi } from '../api/client'

const UserContext = createContext(null)

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Restore session from localStorage on page load
    useEffect(() => {
        const restoreSession = async () => {
            const userId = localStorage.getItem('adaptiq_userId')
            if (!userId) {
                setLoading(false)
                return
            }
            try {
                const data = await userApi.getById(userId)
                setUser(data.user)
            } catch {
                // Session invalid — clear it
                localStorage.removeItem('adaptiq_userId')
                localStorage.removeItem('adaptiq_email')
            } finally {
                setLoading(false)
            }
        }
        restoreSession()
    }, [])

    const login = (userData) => {
        setUser(userData)
        localStorage.setItem('adaptiq_userId', userData._id)
        localStorage.setItem('adaptiq_email', userData.email)
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('adaptiq_userId')
        localStorage.removeItem('adaptiq_email')
    }

    const refreshUser = async () => {
        if (!user?._id) return
        try {
            const data = await userApi.getById(user._id)
            setUser(data.user)
        } catch (err) {
            console.error('Failed to refresh user:', err)
        }
    }

    const updateUserLocally = (updates) => {
        setUser(prev => ({ ...prev, ...updates }))
    }

    return (
        <UserContext.Provider value={{ user, loading, login, logout, refreshUser, updateUserLocally }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const ctx = useContext(UserContext)
    if (!ctx) throw new Error('useUser must be used within UserProvider')
    return ctx
}
