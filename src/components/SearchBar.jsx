/**
 * SearchBar Component
 * Provides search and filter controls for questions
 */

import { useStore, DIFFICULTY_LEVELS, FILTER_ALL, FILTER_SOLVED, FILTER_UNSOLVED } from '../store/useStore'
import { getModifierKey } from '../hooks/useKeyboardShortcuts'

// ============================================================================
// Icon Components (Inline for simplicity)
// ============================================================================

function SearchIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    )
}

function ClearIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    )
}

// ============================================================================
// SearchBar Component
// ============================================================================

function SearchBar() {
    const searchQuery = useStore(state => state.searchQuery)
    const filterDifficulty = useStore(state => state.filterDifficulty)
    const filterStatus = useStore(state => state.filterStatus)
    const theme = useStore(state => state.theme)
    const setSearchQuery = useStore(state => state.setSearchQuery)
    const setFilterDifficulty = useStore(state => state.setFilterDifficulty)
    const setFilterStatus = useStore(state => state.setFilterStatus)

    const isLight = theme === 'light'
    const hasActiveFilters = searchQuery || filterDifficulty !== FILTER_ALL || filterStatus !== FILTER_ALL

    const clearAllFilters = () => {
        setSearchQuery('')
        setFilterDifficulty(FILTER_ALL)
        setFilterStatus(FILTER_ALL)
    }

    // Theme-aware classes
    const containerClass = isLight
        ? 'bg-white border-gray-200'
        : 'bg-[#1a1a1a] border-[#333]'

    const inputClass = isLight
        ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
        : 'bg-[#252525] border-[#333] text-white placeholder-gray-500'

    const selectClass = isLight
        ? 'bg-gray-50 border-gray-200 text-gray-900'
        : 'bg-[#252525] border-[#333] text-white'

    return (
        <div
            className={`flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border ${containerClass}`}
            role="search"
            aria-label="Filter questions"
        >
            {/* Search Input */}
            <div className="flex-1 min-w-[200px] relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="search"
                    data-search-input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search questions... (${getModifierKey()}+K)`}
                    aria-label="Search questions"
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors ${inputClass}`}
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Clear search"
                    >
                        <ClearIcon className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Difficulty Filter */}
            <label className="sr-only" htmlFor="difficulty-filter">Filter by difficulty</label>
            <select
                id="difficulty-filter"
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className={`px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#6366f1] transition-colors cursor-pointer ${selectClass}`}
            >
                <option value={FILTER_ALL}>All Difficulties</option>
                <option value={DIFFICULTY_LEVELS.EASY}>{DIFFICULTY_LEVELS.EASY}</option>
                <option value={DIFFICULTY_LEVELS.MEDIUM}>{DIFFICULTY_LEVELS.MEDIUM}</option>
                <option value={DIFFICULTY_LEVELS.HARD}>{DIFFICULTY_LEVELS.HARD}</option>
                <option value={DIFFICULTY_LEVELS.BASIC}>{DIFFICULTY_LEVELS.BASIC}</option>
            </select>

            {/* Status Filter */}
            <label className="sr-only" htmlFor="status-filter">Filter by status</label>
            <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#6366f1] transition-colors cursor-pointer ${selectClass}`}
            >
                <option value={FILTER_ALL}>All Status</option>
                <option value={FILTER_SOLVED}>Solved</option>
                <option value={FILTER_UNSOLVED}>Unsolved</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    aria-label="Clear all filters"
                >
                    <ClearIcon className="w-4 h-4" />
                    Clear
                </button>
            )}
        </div>
    )
}

export default SearchBar
