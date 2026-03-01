import { useRef, useCallback, useEffect, useState } from 'react'

export default function useBehavioralTracker() {
    const session = useRef({
        startTime: Date.now(),
        startHour: new Date().getHours(),
        scrollMax: 0,
        fieldFocusTimes: {},
        fieldDurations: [],
        fieldRevisits: {},
        totalRevisits: 0,
        answerChanges: 0,
        previousAnswers: {},
        sectionsViewed: new Set(),
        sectionsCompleted: new Set(),
        totalSections: 2,
        interactions: 0,
    })

    const [signals, setSignals] = useState({
        scrollMax: 0, totalRevisits: 0, answerChanges: 0,
        avgSpeed: null, avgSectionTime: 0, abandoned: 2,
        usagePattern: '', sessionStart: '', sessionDuration: '0s',
        states: { confused: 0, overwhelmed: 0, engaged: 0, bored: 0 },
    })

    const sectionTimers = useRef({})

    // ——— Scroll tracking ———
    useEffect(() => {
        let ticking = false
        const onScroll = () => {
            if (!ticking) {
                ticking = true
                requestAnimationFrame(() => {
                    const docH = document.documentElement.scrollHeight - window.innerHeight
                    if (docH > 0) {
                        const pct = Math.round((window.scrollY / docH) * 100)
                        session.current.scrollMax = Math.max(session.current.scrollMax, pct)
                    }
                    ticking = false
                })
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // ——— Section visibility ———
    const observeSection = useCallback((node, sectionId) => {
        if (!node) return
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    session.current.sectionsViewed.add(sectionId)
                    if (!sectionTimers.current[sectionId]) sectionTimers.current[sectionId] = { total: 0 }
                    sectionTimers.current[sectionId].start = Date.now()
                } else if (sectionTimers.current[sectionId]?.start) {
                    sectionTimers.current[sectionId].total += Date.now() - sectionTimers.current[sectionId].start
                    sectionTimers.current[sectionId].start = null
                }
            })
        }, { threshold: 0.3 })
        obs.observe(node)
        return () => obs.disconnect()
    }, [])

    // ——— Field focus/blur ———
    const trackFieldFocus = useCallback((fieldId) => {
        session.current.fieldFocusTimes[fieldId] = Date.now()
        session.current.fieldRevisits[fieldId] = (session.current.fieldRevisits[fieldId] || 0) + 1
        if (session.current.fieldRevisits[fieldId] > 1) session.current.totalRevisits++
        session.current.interactions++
    }, [])

    const trackFieldBlur = useCallback((fieldId) => {
        if (session.current.fieldFocusTimes[fieldId]) {
            session.current.fieldDurations.push(Date.now() - session.current.fieldFocusTimes[fieldId])
            delete session.current.fieldFocusTimes[fieldId]
        }
    }, [])

    // ——— Answer change detection ———
    const trackAnswerChange = useCallback((key, newVal) => {
        const prev = session.current.previousAnswers[key]
        if (prev !== undefined && prev !== newVal) session.current.answerChanges++
        session.current.previousAnswers[key] = newVal
        session.current.interactions++
    }, [])

    // ——— Mark section complete ———
    const markSectionComplete = useCallback((sectionId) => {
        session.current.sectionsCompleted.add(sectionId)
    }, [])

    // ——— Usage pattern ———
    const getUsagePattern = () => {
        const h = session.current.startHour
        if (h >= 5 && h < 12) return '☀️ Morning'
        if (h >= 12 && h < 17) return '🌤️ Afternoon'
        if (h >= 17 && h < 21) return '🌅 Evening'
        return '🌙 Night'
    }

    // ——— State inference ———
    const inferStates = useCallback(() => {
        const s = session.current
        const avgSpeed = s.fieldDurations.length
            ? s.fieldDurations.reduce((a, b) => a + b, 0) / s.fieldDurations.length / 1000 : 0
        const elapsed = (Date.now() - s.startTime) / 1000
        const scroll = s.scrollMax
        const revisits = s.totalRevisits
        const changes = s.answerChanges
        const abandoned = s.totalSections - s.sectionsCompleted.size

        let confused = Math.min(revisits * 12 + (avgSpeed > 15 ? 25 : avgSpeed > 8 ? 15 : 0) + Math.min(changes * 15, 35), 100)
        let overwhelmed = Math.min((abandoned > 0 ? abandoned * 30 : 0) + (scroll < 30 ? 30 : scroll < 60 ? 15 : 0) + (elapsed < 20 && s.interactions < 3 ? 25 : 0), 100)
        let engaged = Math.min((scroll > 70 ? 30 : scroll > 40 ? 20 : 5) + (s.sectionsCompleted.size > 0 ? 25 : 0) + (avgSpeed > 3 && avgSpeed < 20 ? 25 : 5) + (s.interactions > 5 ? 20 : s.interactions > 2 ? 10 : 0), 100)
        let bored = Math.min((avgSpeed > 0 && avgSpeed < 2 ? 35 : 0) + (elapsed > 10 && s.interactions < 3 ? 30 : 0) + (scroll < 20 && elapsed > 15 ? 25 : 0), 100)

        return { confused, overwhelmed, engaged, bored }
    }, [])

    // ——— Update loop ———
    useEffect(() => {
        const id = setInterval(() => {
            // Flush active section timers
            Object.keys(sectionTimers.current).forEach(k => {
                if (sectionTimers.current[k].start) {
                    sectionTimers.current[k].total += Date.now() - sectionTimers.current[k].start
                    sectionTimers.current[k].start = Date.now()
                }
            })

            const s = session.current
            const avgSpeed = s.fieldDurations.length
                ? (s.fieldDurations.reduce((a, b) => a + b, 0) / s.fieldDurations.length / 1000).toFixed(1) : null
            const totalSecTime = Object.values(sectionTimers.current).reduce((sum, t) => sum + t.total, 0)
            const avgSecTime = s.sectionsViewed.size > 0 ? Math.round(totalSecTime / s.sectionsViewed.size / 1000) : 0
            const elapsed = Math.round((Date.now() - s.startTime) / 1000)
            const abandoned = s.totalSections - s.sectionsCompleted.size

            setSignals({
                scrollMax: s.scrollMax,
                totalRevisits: s.totalRevisits,
                answerChanges: s.answerChanges,
                avgSpeed,
                avgSectionTime: avgSecTime,
                abandoned,
                usagePattern: getUsagePattern(),
                sessionStart: new Date(s.startTime).toLocaleTimeString(),
                sessionDuration: elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
                states: inferStates(),
            })

            // Persist
            localStorage.setItem('behavioralSignals', JSON.stringify({
                scrollMax: s.scrollMax, totalRevisits: s.totalRevisits, "answerChanges": s.answerChanges,
                avgSpeed, sectionsViewed: [...s.sectionsViewed], sectionsCompleted: [...s.sectionsCompleted],
                sessionDuration: Date.now() - s.startTime, usagePattern: getUsagePattern(),
                inferredStates: inferStates(), timestamp: new Date().toISOString(),
            }))
        }, 1500)
        return () => clearInterval(id)
    }, [inferStates])

    return { signals, observeSection, trackFieldFocus, trackFieldBlur, trackAnswerChange, markSectionComplete }
}
