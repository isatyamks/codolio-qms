/**
 * StatsPanel Component
 * Displays detailed progress statistics in a floating panel
 */

import { useMemo } from 'react'
import { useStore, calculateDetailedStats, DIFFICULTY_LEVELS } from '../store/useStore'

// ============================================================================
// Constants
// ============================================================================

const DIFFICULTY_COLORS = Object.freeze({
    [DIFFICULTY_LEVELS.EASY]: '#22c55e',
    [DIFFICULTY_LEVELS.MEDIUM]: '#f59e0b',
    [DIFFICULTY_LEVELS.HARD]: '#ef4444',
    [DIFFICULTY_LEVELS.BASIC]: '#3b82f6',
})

const MAX_TOPICS_SHOWN = 5

// ============================================================================
// Sub-Components
// ============================================================================

function CloseButton({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            aria-label="Close statistics panel"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    )
}

function OverallProgress({ solved, total }) {
    const percentage = total > 0 ? (solved / total) * 100 : 0

    return (
        <div className="text-center p-4 bg-[#252525] rounded-lg">
            <div className="text-3xl font-bold text-white">
                {solved} / {total}
            </div>
            <div className="text-sm text-gray-400 mt-1">Questions Completed</div>
            <div
                className="w-full h-2 bg-[#333] rounded-full mt-3 overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Overall progress"
            >
                <div
                    className="h-full bg-gradient-to-r from-[#6366f1] to-[#22c55e] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

function DifficultyProgress({ difficulty, solved, total }) {
    const color = DIFFICULTY_COLORS[difficulty] || '#6b7280'
    const percentage = total > 0 ? (solved / total) * 100 : 0

    return (
        <div className="flex items-center gap-3">
            <span className="w-16 text-xs font-medium" style={{ color }}>
                {difficulty}
            </span>
            <div
                className="flex-1 h-2 bg-[#333] rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${difficulty} progress`}
            >
                <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-xs text-gray-500 w-12 text-right">
                {solved}/{total}
            </span>
        </div>
    )
}

function TopicProgress({ name, solved, total }) {
    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300 truncate flex-1" title={name}>
                {name}
            </span>
            <span className="text-xs text-gray-500">{percentage}%</span>
        </div>
    )
}

// ============================================================================
// Main Component
// ============================================================================

function StatsPanel() {
    const topics = useStore(state => state.topics)
    const showStats = useStore(state => state.showStats)
    const toggleStats = useStore(state => state.toggleStats)

    // Memoize expensive calculations
    const stats = useMemo(() => calculateDetailedStats(topics), [topics])

    // Sort topics by completion percentage (descending) - create new array to avoid mutation
    const sortedTopics = useMemo(() => {
        return [...stats.byTopic]
            .sort((a, b) => {
                const aPercentage = a.total > 0 ? a.solved / a.total : 0
                const bPercentage = b.total > 0 ? b.solved / b.total : 0
                return bPercentage - aPercentage
            })
            .slice(0, MAX_TOPICS_SHOWN)
    }, [stats.byTopic])

    // Filter difficulties that have questions
    const activeDifficulties = useMemo(() => {
        return Object.entries(stats.byDifficulty)
            .filter(([, data]) => data.total > 0)
    }, [stats.byDifficulty])

    if (!showStats) return null

    return (
        <aside
            className="fixed right-4 top-24 w-80 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl z-40 animate-slideIn"
            role="complementary"
            aria-label="Progress statistics"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#333]">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Statistics
                </h3>
                <CloseButton onClick={toggleStats} />
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Overall Progress */}
                <OverallProgress solved={stats.solved} total={stats.total} />

                {/* By Difficulty */}
                {activeDifficulties.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">By Difficulty</h4>
                        <div className="space-y-2">
                            {activeDifficulties.map(([difficulty, data]) => (
                                <DifficultyProgress
                                    key={difficulty}
                                    difficulty={difficulty}
                                    solved={data.solved}
                                    total={data.total}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* By Topic (Top 5) */}
                {sortedTopics.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Top Topics</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {sortedTopics.map((topic, idx) => (
                                <TopicProgress
                                    key={topic.name || idx}
                                    name={topic.name}
                                    solved={topic.solved}
                                    total={topic.total}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Keyboard shortcut hint */}
                <div className="text-center pt-2 border-t border-[#333]">
                    <span className="text-xs text-gray-500">
                        Press <kbd className="px-1.5 py-0.5 bg-[#333] rounded text-gray-400 font-mono">S</kbd> to toggle
                    </span>
                </div>
            </div>
        </aside>
    )
}

export default StatsPanel
