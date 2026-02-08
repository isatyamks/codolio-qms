/**
 * Header Component
 * Displays sheet info, progress, and action buttons
 */

import { useStore, THEMES } from '../store/useStore'

// ============================================================================
// Icon Components
// ============================================================================

function PlusIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    )
}

function ChartIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    )
}

function SunIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    )
}

function MoonIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    )
}

function ExpandIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
    )
}

function ResetIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    )
}

// ============================================================================
// Progress Ring Component
// ============================================================================

function ProgressRing({ percentage, solved, total, theme }) {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - percentage / 100)
    const isLight = theme === THEMES.LIGHT

    return (
        <div className="relative w-24 h-24" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
            <svg className="w-24 h-24 transform -rotate-90" aria-hidden="true">
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke={isLight ? '#e5e7eb' : '#333'}
                    strokeWidth="8"
                    fill="none"
                />
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#22c55e"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-500"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {percentage}%
                </span>
                <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    {solved}/{total}
                </span>
            </div>
        </div>
    )
}

// ============================================================================
// Main Component
// ============================================================================

function Header({ progress, onAddTopic, openModal }) {
    const sheet = useStore(state => state.sheet)
    const theme = useStore(state => state.theme)
    const toggleTheme = useStore(state => state.toggleTheme)
    const toggleStats = useStore(state => state.toggleStats)
    const expandAllTopics = useStore(state => state.expandAllTopics)

    const isLight = theme === THEMES.LIGHT
    const bgColor = isLight ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-[#333]'
    const textColor = isLight ? 'text-gray-800' : 'text-white'
    const mutedColor = isLight ? 'text-gray-500' : 'text-gray-400'
    const buttonBg = isLight
        ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        : 'bg-[#252525] hover:bg-[#333] text-gray-400'

    return (
        <header className={`${bgColor} border-b`}>
            <div className="w-[95%] max-w-[1800px] mx-auto py-6">
                <div className="flex items-start justify-between gap-6">
                    {/* Left Section - Sheet Info */}
                    <div className="flex-1">
                        {/* Breadcrumb */}
                        <nav className={`flex items-center gap-2 text-sm ${mutedColor} mb-2`} aria-label="Breadcrumb">
                            <span>Sheets</span>
                            <span aria-hidden="true">/</span>
                            <span className={textColor}>{sheet?.name}</span>
                        </nav>

                        {/* Title */}
                        <h1 className={`text-2xl font-bold ${textColor} mb-2`}>
                            {sheet?.name || 'Question Sheet'}
                        </h1>

                        {/* Description */}
                        {sheet?.description && (
                            <p className={`${mutedColor} text-sm mb-4 max-w-3xl line-clamp-2`}>
                                {sheet.description}
                            </p>
                        )}

                        {/* Tags and Stats */}
                        <div className="flex items-center gap-4 flex-wrap">
                            {sheet?.tags?.map((tag) => (
                                <span
                                    key={tag}
                                    className={`px-3 py-1 ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#252525] border-[#333]'} ${mutedColor} text-xs rounded-full border`}
                                >
                                    {tag}
                                </span>
                            ))}

                            {sheet?.followers !== undefined && (
                                <span className={`${mutedColor} text-sm`}>
                                    {sheet.followers.toLocaleString()} followers
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right Section - Progress & Actions */}
                    <div className="flex flex-col items-center gap-3">
                        {/* Progress Ring */}
                        <ProgressRing
                            percentage={progress.percentage}
                            solved={progress.solved}
                            total={progress.total}
                            theme={theme}
                        />

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onAddTopic}
                                className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                title="Add Topic (Ctrl+N)"
                                aria-label="Add new topic"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Add
                            </button>

                            <button
                                onClick={toggleStats}
                                className={`p-2 ${buttonBg} rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]`}
                                title="Statistics (S)"
                                aria-label="Toggle statistics panel"
                            >
                                <ChartIcon className="w-5 h-5" />
                            </button>

                            <button
                                onClick={toggleTheme}
                                className={`p-2 ${buttonBg} rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]`}
                                title="Toggle Theme (T)"
                                aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
                            >
                                {isLight ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={expandAllTopics}
                                className={`p-2 ${buttonBg} rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]`}
                                title="Expand All (Ctrl+E)"
                                aria-label="Expand all topics"
                            >
                                <ExpandIcon className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => openModal('resetProgress')}
                                className={`p-2 ${buttonBg} rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]`}
                                title="Reset Progress"
                                aria-label="Reset all progress"
                            >
                                <ResetIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
