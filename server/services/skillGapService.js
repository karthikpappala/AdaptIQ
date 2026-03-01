import skillMaps from '../data/skillMaps.js'

/**
 * Computes the skill gap between what the user knows and what their target role requires.
 * This is fully rule-based — no LLM involved.
 */
export function computeSkillGap(user) {
    const targetRole = user.goals?.targetRole || user.staticProfile?.currentRole || 'Software Developer'
    const strongTopics = user.competencyMetrics?.strongTopics || []
    const topics = user.preferences?.topics || []
    const experience = user.staticProfile?.experience || 'Beginner'

    // Find the closest matching role in skill maps
    const roleKey = findClosestRole(targetRole)
    const roleSkills = skillMaps[roleKey]

    if (!roleSkills) {
        return {
            targetRole,
            matchedRole: 'Software Developer',
            categories: [],
            overallGapPercent: 100,
            missingSkills: [],
            knownSkills: [],
        }
    }

    // User's known skills (from topics + strongTopics, normalized to lowercase)
    const userKnown = new Set([
        ...strongTopics.map(s => s.toLowerCase()),
        ...topics.map(t => t.toLowerCase()),
    ])

    // Experience level bonus — beginners get base skills credited
    const experienceBonus = getExperienceBonus(experience)

    const categories = []
    const allRequired = []
    const allMissing = []
    const allKnown = []

    for (const [category, skills] of Object.entries(roleSkills)) {
        const required = skills
        const known = required.filter(skill =>
            userKnown.has(skill.toLowerCase()) || experienceBonus.includes(skill.toLowerCase())
        )
        const missing = required.filter(skill =>
            !userKnown.has(skill.toLowerCase()) && !experienceBonus.includes(skill.toLowerCase())
        )

        const completionPct = Math.round((known.length / required.length) * 100)

        categories.push({
            name: category,
            required,
            known,
            missing,
            completionPct,
        })

        allRequired.push(...required)
        allMissing.push(...missing)
        allKnown.push(...known)
    }

    const overallGapPercent = Math.round((allMissing.length / allRequired.length) * 100)

    // Prioritize missing skills — put skills in earlier categories first
    const prioritizedMissing = categories
        .flatMap(c => c.missing.map((skill, i) => ({ skill, category: c.name, priority: i })))
        .sort((a, b) => a.priority - b.priority)
        .map(s => ({ skill: s.skill, category: s.category }))

    return {
        targetRole,
        matchedRole: roleKey,
        categories,
        overallGapPercent,
        missingSkills: prioritizedMissing,
        knownSkills: allKnown,
        totalRequired: allRequired.length,
        totalKnown: allKnown.length,
    }
}

function findClosestRole(targetRole) {
    if (!targetRole) return 'Software Developer'
    const roles = Object.keys(skillMaps)
    const lower = targetRole.toLowerCase()

    // Exact match
    const exact = roles.find(r => r.toLowerCase() === lower)
    if (exact) return exact

    // Partial match
    const partial = roles.find(r => lower.includes(r.toLowerCase()) || r.toLowerCase().includes(lower))
    if (partial) return partial

    return 'Software Developer'
}

function getExperienceBonus(experience) {
    // Advanced/Expert users are credited with basic skills
    if (experience === 'Advanced' || experience === 'Expert') {
        return ['git', 'problem solving', 'communication', 'linux basics', 'sql']
    }
    if (experience === 'Intermediate') {
        return ['git', 'problem solving']
    }
    return []
}

export function getAvailableRoles() {
    return Object.keys(skillMaps)
}
