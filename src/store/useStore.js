/**
 * Question Sheet Store - Zustand State Management
 * Handles all application state for the question management system
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import sheetData from '../../sheet.json'

// ============================================================================
// Constants
// ============================================================================

export const STORAGE_KEY = 'question-sheet-storage'

export const DIFFICULTY_LEVELS = Object.freeze({
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
    BASIC: 'Basic',
})

export const FILTER_ALL = 'all'
export const FILTER_SOLVED = 'solved'
export const FILTER_UNSOLVED = 'unsolved'

export const THEME_DARK = 'dark'
export const THEME_LIGHT = 'light'

export const THEMES = Object.freeze({
    LIGHT: THEME_LIGHT,
    DARK: THEME_DARK,
})

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Safely generates a unique ID with a prefix
 */
function generateId(prefix) {
    return `${prefix}-${uuidv4()}`
}

/**
 * Validates and sanitizes a string input
 */
function sanitizeString(value, fallback = '') {
    if (typeof value !== 'string') return fallback
    return value.trim() || fallback
}

/**
 * Validates difficulty level, returns default if invalid
 */
function validateDifficulty(difficulty) {
    const validDifficulties = Object.values(DIFFICULTY_LEVELS)
    return validDifficulties.includes(difficulty) ? difficulty : DIFFICULTY_LEVELS.MEDIUM
}

/**
 * Validates URL format (basic check)
 */
function validateUrl(url) {
    if (!url || typeof url !== 'string') return ''
    const trimmed = url.trim()
    if (!trimmed) return ''
    try {
        new URL(trimmed)
        return trimmed
    } catch {
        return trimmed.startsWith('http') ? trimmed : ''
    }
}

/**
 * Updates a nested item within the topics structure
 * Reduces code duplication across update operations
 */
function updateTopicsNested(topics, topicId, subtopicId, questionId, updater) {
    return topics.map(topic => {
        if (topicId && topic.id !== topicId) return topic

        return {
            ...topic,
            subtopics: topic.subtopics.map(subtopic => {
                if (subtopicId && subtopic.id !== subtopicId) return subtopic

                if (questionId !== undefined) {
                    return {
                        ...subtopic,
                        questions: subtopic.questions.map(q =>
                            q.id === questionId ? updater(q) : q
                        )
                    }
                }

                return updater(subtopic)
            })
        }
    })
}

/**
 * Reorders items in an array by moving item from oldIndex to newIndex
 */
function reorderArray(array, oldIndex, newIndex) {
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return array
    }
    const result = [...array]
    const [removed] = result.splice(oldIndex, 1)
    result.splice(newIndex, 0, removed)
    return result.map((item, index) => ({ ...item, order: index }))
}

// ============================================================================
// Data Transformation
// ============================================================================

/**
 * Transforms raw question data from JSON into normalized structure
 */
function transformSheetData(rawData) {
    if (!rawData?.data?.sheet || !rawData?.data?.questions) {
        throw new Error('Invalid sheet data format')
    }

    const { sheet, questions } = rawData.data
    const topicsMap = new Map()

    questions.forEach((q) => {
        const topicName = sanitizeString(q.topic, 'General')
        const subtopicName = sanitizeString(q.subTopic, 'General')

        if (!topicsMap.has(topicName)) {
            topicsMap.set(topicName, {
                id: `topic-${topicsMap.size}`,
                name: topicName,
                order: topicsMap.size,
                subtopics: new Map(),
            })
        }

        const topic = topicsMap.get(topicName)

        if (!topic.subtopics.has(subtopicName)) {
            topic.subtopics.set(subtopicName, {
                id: `subtopic-${topic.id}-${topic.subtopics.size}`,
                name: subtopicName,
                order: topic.subtopics.size,
                questions: [],
            })
        }

        const subtopic = topic.subtopics.get(subtopicName)

        subtopic.questions.push({
            id: q._id || generateId('question'),
            title: sanitizeString(q.title, 'Untitled Question'),
            topic: topicName,
            subtopic: subtopicName,
            difficulty: validateDifficulty(q.questionId?.difficulty),
            url: validateUrl(q.questionId?.problemUrl),
            resource: sanitizeString(q.resource),
            tags: Array.isArray(q.questionId?.topics) ? q.questionId.topics : [],
            isSolved: Boolean(q.isSolved),
            order: subtopic.questions.length,
            notes: '',
        })
    })

    const topics = Array.from(topicsMap.values()).map(topic => ({
        ...topic,
        subtopics: Array.from(topic.subtopics.values()),
    }))

    return {
        sheet: {
            id: sheet._id || generateId('sheet'),
            name: sanitizeString(sheet.name, 'Question Sheet'),
            description: sanitizeString(sheet.description),
            author: sanitizeString(sheet.author),
            followers: typeof sheet.followers === 'number' ? sheet.followers : 0,
            banner: sanitizeString(sheet.banner),
            link: validateUrl(sheet.link),
            tags: Array.isArray(sheet.tag) ? sheet.tag.filter(t => typeof t === 'string') : [],
        },
        topics,
    }
}

// ============================================================================
// Store Definition
// ============================================================================

export const useStore = create(
    persist(
        (set, get) => ({
            // State
            sheet: null,
            topics: [],
            expandedTopics: {},
            expandedSubtopics: {},
            loading: true,
            error: null,
            searchQuery: '',
            filterDifficulty: FILTER_ALL,
            filterStatus: FILTER_ALL,
            theme: THEME_DARK,
            showStats: false,

            // Data Loading
            fetchSheetData: () => {
                const state = get()

                // Skip if data already loaded from persistence
                if (state.topics.length > 0 && !state.loading) {
                    return
                }

                set({ loading: true, error: null })

                try {
                    const { sheet, topics } = transformSheetData(sheetData)
                    set({ sheet, topics, loading: false })
                } catch (error) {
                    console.error('Failed to load sheet data:', error)
                    set({
                        error: error instanceof Error ? error.message : 'Failed to load data',
                        loading: false
                    })
                }
            },

            resetProgress: () => {
                localStorage.removeItem(STORAGE_KEY)
                set({ topics: [], sheet: null, loading: true, error: null })
                // Re-fetch after state reset
                setTimeout(() => get().fetchSheetData(), 0)
            },

            // UI State Actions
            toggleTopicExpansion: (topicId) => {
                if (!topicId) return
                const { expandedTopics } = get()
                set({ expandedTopics: { ...expandedTopics, [topicId]: !expandedTopics[topicId] } })
            },

            toggleSubtopicExpansion: (subtopicId) => {
                if (!subtopicId) return
                const { expandedSubtopics } = get()
                set({ expandedSubtopics: { ...expandedSubtopics, [subtopicId]: !expandedSubtopics[subtopicId] } })
            },

            expandAllTopics: () => {
                const { topics } = get()
                const expanded = Object.fromEntries(topics.map(t => [t.id, true]))
                set({ expandedTopics: expanded })
            },

            collapseAllTopics: () => {
                set({ expandedTopics: {} })
            },

            setSearchQuery: (query) => {
                set({ searchQuery: typeof query === 'string' ? query : '' })
            },

            setFilterDifficulty: (difficulty) => {
                set({ filterDifficulty: difficulty || FILTER_ALL })
            },

            setFilterStatus: (status) => {
                set({ filterStatus: status || FILTER_ALL })
            },

            toggleTheme: () => {
                const { theme } = get()
                set({ theme: theme === THEME_DARK ? THEME_LIGHT : THEME_DARK })
            },

            toggleStats: () => {
                set(state => ({ showStats: !state.showStats }))
            },

            // Question Actions
            toggleQuestionSolved: (questionId) => {
                if (!questionId) return
                const { topics } = get()
                const newTopics = topics.map(topic => ({
                    ...topic,
                    subtopics: topic.subtopics.map(subtopic => ({
                        ...subtopic,
                        questions: subtopic.questions.map(q =>
                            q.id === questionId ? { ...q, isSolved: !q.isSolved } : q
                        )
                    }))
                }))
                set({ topics: newTopics })
            },

            toggleAllInSubtopic: (topicId, subtopicId, solved) => {
                if (!topicId || !subtopicId) return
                const { topics } = get()
                const newTopics = updateTopicsNested(
                    topics,
                    topicId,
                    subtopicId,
                    undefined,
                    subtopic => ({
                        ...subtopic,
                        questions: subtopic.questions.map(q => ({ ...q, isSolved: Boolean(solved) }))
                    })
                )
                set({ topics: newTopics })
            },

            updateQuestionNotes: (questionId, notes) => {
                if (!questionId) return
                const { topics } = get()
                const newTopics = topics.map(topic => ({
                    ...topic,
                    subtopics: topic.subtopics.map(subtopic => ({
                        ...subtopic,
                        questions: subtopic.questions.map(q =>
                            q.id === questionId ? { ...q, notes: sanitizeString(notes) } : q
                        )
                    }))
                }))
                set({ topics: newTopics })
            },

            // Topic CRUD
            addTopic: (name) => {
                const sanitizedName = sanitizeString(name)
                if (!sanitizedName) return

                const { topics } = get()
                const newTopic = {
                    id: generateId('topic'),
                    name: sanitizedName,
                    order: topics.length,
                    subtopics: [],
                }
                set({ topics: [...topics, newTopic] })
            },

            updateTopic: (topicId, name) => {
                const sanitizedName = sanitizeString(name)
                if (!topicId || !sanitizedName) return

                const { topics } = get()
                set({
                    topics: topics.map(t => t.id === topicId ? { ...t, name: sanitizedName } : t)
                })
            },

            deleteTopic: (topicId) => {
                if (!topicId) return
                const { topics, expandedTopics } = get()
                const newExpanded = { ...expandedTopics }
                delete newExpanded[topicId]
                set({
                    topics: topics.filter(t => t.id !== topicId),
                    expandedTopics: newExpanded
                })
            },

            // Subtopic CRUD
            addSubtopic: (topicId, name) => {
                const sanitizedName = sanitizeString(name)
                if (!topicId || !sanitizedName) return

                const { topics } = get()
                set({
                    topics: topics.map(t => {
                        if (t.id !== topicId) return t
                        return {
                            ...t,
                            subtopics: [...t.subtopics, {
                                id: generateId('subtopic'),
                                name: sanitizedName,
                                order: t.subtopics.length,
                                questions: [],
                            }]
                        }
                    })
                })
            },

            updateSubtopic: (topicId, subtopicId, name) => {
                const sanitizedName = sanitizeString(name)
                if (!topicId || !subtopicId || !sanitizedName) return

                const { topics } = get()
                set({
                    topics: topics.map(t => {
                        if (t.id !== topicId) return t
                        return {
                            ...t,
                            subtopics: t.subtopics.map(s =>
                                s.id === subtopicId ? { ...s, name: sanitizedName } : s
                            )
                        }
                    })
                })
            },

            deleteSubtopic: (topicId, subtopicId) => {
                if (!topicId || !subtopicId) return
                const { topics, expandedSubtopics } = get()
                const newExpanded = { ...expandedSubtopics }
                delete newExpanded[subtopicId]
                set({
                    topics: topics.map(t => {
                        if (t.id !== topicId) return t
                        return {
                            ...t,
                            subtopics: t.subtopics.filter(s => s.id !== subtopicId)
                        }
                    }),
                    expandedSubtopics: newExpanded
                })
            },

            // Question CRUD
            addQuestion: (topicId, subtopicId, questionData) => {
                if (!topicId || !subtopicId || !questionData) return

                const title = sanitizeString(questionData.title)
                if (!title) return

                const { topics } = get()
                set({
                    topics: topics.map(t => {
                        if (t.id !== topicId) return t
                        return {
                            ...t,
                            subtopics: t.subtopics.map(s => {
                                if (s.id !== subtopicId) return s
                                return {
                                    ...s,
                                    questions: [...s.questions, {
                                        id: generateId('question'),
                                        title,
                                        difficulty: validateDifficulty(questionData.difficulty),
                                        url: validateUrl(questionData.url),
                                        isSolved: false,
                                        order: s.questions.length,
                                        notes: '',
                                    }]
                                }
                            })
                        }
                    })
                })
            },

            updateQuestion: (topicId, subtopicId, questionId, questionData) => {
                if (!topicId || !subtopicId || !questionId || !questionData) return

                const { topics } = get()
                set({
                    topics: topics.map(t => {
                        if (t.id !== topicId) return t
                        return {
                            ...t,
                            subtopics: t.subtopics.map(s => {
                                if (s.id !== subtopicId) return s
                                return {
                                    ...s,
                                    questions: s.questions.map(q => {
                                        if (q.id !== questionId) return q
                                        return {
                                            ...q,
                                            ...(questionData.title && { title: sanitizeString(questionData.title) }),
                                            ...(questionData.difficulty && { difficulty: validateDifficulty(questionData.difficulty) }),
                                            ...(questionData.url !== undefined && { url: validateUrl(questionData.url) }),
                                        }
                                    })
                                }
                            })
                        }
                    })
                })
            },

            deleteQuestion: (topicId, subtopicId, questionId) => {
                if (!topicId || !subtopicId || !questionId) return

                const { topics } = get()
                set({
                    topics: topics.map(t => {
                        if (t.id !== topicId) return t
                        return {
                            ...t,
                            subtopics: t.subtopics.map(s => {
                                if (s.id !== subtopicId) return s
                                return {
                                    ...s,
                                    questions: s.questions.filter(q => q.id !== questionId)
                                }
                            })
                        }
                    })
                })
            },

            // Reorder Actions
            reorderTopics: (activeId, overId) => {
                if (!activeId || !overId || activeId === overId) return

                const { topics } = get()
                const oldIndex = topics.findIndex(t => t.id === activeId)
                const newIndex = topics.findIndex(t => t.id === overId)

                if (oldIndex !== -1 && newIndex !== -1) {
                    set({ topics: reorderArray(topics, oldIndex, newIndex) })
                }
            },

            reorderSubtopics: (topicId, activeId, overId) => {
                if (!topicId || !activeId || !overId || activeId === overId) return

                const { topics } = get()
                set({
                    topics: topics.map(t => {
                        if (t.id !== topicId) return t

                        const oldIndex = t.subtopics.findIndex(s => s.id === activeId)
                        const newIndex = t.subtopics.findIndex(s => s.id === overId)

                        if (oldIndex === -1 || newIndex === -1) return t

                        return {
                            ...t,
                            subtopics: reorderArray(t.subtopics, oldIndex, newIndex)
                        }
                    })
                })
            },

            reorderQuestions: (topicId, subtopicId, activeId, overId) => {
                if (!topicId || !subtopicId || !activeId || !overId || activeId === overId) return

                const { topics } = get()
                set({
                    topics: topics.map(t => {
                        if (t.id !== topicId) return t
                        return {
                            ...t,
                            subtopics: t.subtopics.map(s => {
                                if (s.id !== subtopicId) return s

                                const oldIndex = s.questions.findIndex(q => q.id === activeId)
                                const newIndex = s.questions.findIndex(q => q.id === overId)

                                if (oldIndex === -1 || newIndex === -1) return s

                                return {
                                    ...s,
                                    questions: reorderArray(s.questions, oldIndex, newIndex)
                                }
                            })
                        }
                    })
                })
            },
        }),
        {
            name: STORAGE_KEY,
            partialize: (state) => ({
                topics: state.topics,
                sheet: state.sheet,
                expandedTopics: state.expandedTopics,
                expandedSubtopics: state.expandedSubtopics,
                theme: state.theme,
                loading: false,
            }),
        }
    )
)

// ============================================================================
// Selector Functions (Pure, No Side Effects)
// ============================================================================

/**
 * Calculates total progress across all topics
 */
export function calculateTotalProgress(topics) {
    if (!Array.isArray(topics)) return { total: 0, solved: 0, percentage: 0 }

    let total = 0
    let solved = 0

    for (const topic of topics) {
        if (!topic?.subtopics) continue
        for (const subtopic of topic.subtopics) {
            if (!subtopic?.questions) continue
            total += subtopic.questions.length
            solved += subtopic.questions.filter(q => q?.isSolved).length
        }
    }

    return {
        total,
        solved,
        percentage: total > 0 ? Math.round((solved / total) * 100) : 0
    }
}

/**
 * Calculates progress for a single topic
 */
export function calculateTopicProgress(topic) {
    if (!topic?.subtopics) return { total: 0, solved: 0 }

    let total = 0
    let solved = 0

    for (const subtopic of topic.subtopics) {
        if (!subtopic?.questions) continue
        total += subtopic.questions.length
        solved += subtopic.questions.filter(q => q?.isSolved).length
    }

    return { total, solved }
}

/**
 * Calculates progress for a single subtopic
 */
export function calculateSubtopicProgress(subtopic) {
    if (!subtopic?.questions) return { total: 0, solved: 0 }

    const total = subtopic.questions.length
    const solved = subtopic.questions.filter(q => q?.isSolved).length

    return { total, solved }
}

/**
 * Calculates detailed statistics across all dimensions
 */
export function calculateDetailedStats(topics) {
    const stats = {
        total: 0,
        solved: 0,
        byDifficulty: {
            [DIFFICULTY_LEVELS.EASY]: { total: 0, solved: 0 },
            [DIFFICULTY_LEVELS.MEDIUM]: { total: 0, solved: 0 },
            [DIFFICULTY_LEVELS.HARD]: { total: 0, solved: 0 },
            [DIFFICULTY_LEVELS.BASIC]: { total: 0, solved: 0 },
        },
        byTopic: [],
    }

    if (!Array.isArray(topics)) return stats

    for (const topic of topics) {
        if (!topic?.subtopics) continue

        const topicStats = { name: topic.name, total: 0, solved: 0 }

        for (const subtopic of topic.subtopics) {
            if (!subtopic?.questions) continue

            for (const q of subtopic.questions) {
                stats.total++
                topicStats.total++

                const difficulty = validateDifficulty(q.difficulty)
                if (stats.byDifficulty[difficulty]) {
                    stats.byDifficulty[difficulty].total++
                }

                if (q.isSolved) {
                    stats.solved++
                    topicStats.solved++
                    if (stats.byDifficulty[difficulty]) {
                        stats.byDifficulty[difficulty].solved++
                    }
                }
            }
        }

        stats.byTopic.push(topicStats)
    }

    return stats
}

/**
 * Filters questions based on search and filter criteria
 */
export function filterQuestions(questions, searchQuery, filterDifficulty, filterStatus) {
    if (!Array.isArray(questions)) return []

    const normalizedSearch = (searchQuery || '').toLowerCase().trim()

    return questions.filter(q => {
        if (!q) return false

        // Search filter
        if (normalizedSearch && !q.title?.toLowerCase().includes(normalizedSearch)) {
            return false
        }

        // Difficulty filter
        if (filterDifficulty && filterDifficulty !== FILTER_ALL) {
            if (q.difficulty !== filterDifficulty) return false
        }

        // Status filter
        if (filterStatus === FILTER_SOLVED && !q.isSolved) return false
        if (filterStatus === FILTER_UNSOLVED && q.isSolved) return false

        return true
    })
}
