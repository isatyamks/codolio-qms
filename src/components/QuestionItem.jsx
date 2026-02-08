/**
 * QuestionItem Component
 * Displays individual question with status, links, and actions
 * UI matches the Codolio design reference with table-like layout
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore, DIFFICULTY_LEVELS } from '../store/useStore'

// ============================================================================
// Constants
// ============================================================================

const DIFFICULTY_COLORS = Object.freeze({
    [DIFFICULTY_LEVELS.EASY]: 'text-[#22c55e]',
    [DIFFICULTY_LEVELS.MEDIUM]: 'text-[#f59e0b]',
    [DIFFICULTY_LEVELS.HARD]: 'text-[#ef4444]',
    [DIFFICULTY_LEVELS.BASIC]: 'text-[#3b82f6]',
})

const MAX_VISIBLE_TAGS = 2

// ============================================================================
// Icon Components
// ============================================================================

function LeetCodeIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
        </svg>
    )
}

function YouTubeIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    )
}

function StarIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    )
}

function NotesIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    )
}

function DragHandleIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
    )
}

// ============================================================================
// Main Component
// ============================================================================

function QuestionItem({ question, topicId, subtopicId, openModal }) {
    const toggleQuestionSolved = useStore(state => state.toggleQuestionSolved)
    const toggleQuestionStarred = useStore(state => state.toggleQuestionStarred)
    const theme = useStore(state => state.theme)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: question.id,
        data: { type: 'question', question, topicId, subtopicId }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const isLight = theme === 'light'
    const difficultyColor = DIFFICULTY_COLORS[question.difficulty] || DIFFICULTY_COLORS[DIFFICULTY_LEVELS.MEDIUM]
    const tags = Array.isArray(question.tags) ? question.tags : []
    const hasResource = Boolean(question.resource)

    return (
        <div ref={setNodeRef} style={style}>
            <div className={`group flex items-center px-4 border-b ${isLight ? 'border-gray-100 hover:bg-gray-50' : 'border-[#252525] hover:bg-[#1a1a1a]'
                } transition-colors`}>

                {/* Drag Handle - Fixed width */}
                <div className="w-8 flex-shrink-0 flex justify-center">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 text-gray-600 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Drag to reorder"
                    >
                        <DragHandleIcon className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Checkbox - Fixed width */}
                <div className="w-8 flex-shrink-0 flex justify-center py-3">
                    <button
                        onClick={() => toggleQuestionSolved(question.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${question.isSolved
                            ? 'bg-[#22c55e] border-[#22c55e]'
                            : isLight
                                ? 'border-gray-300 hover:border-[#22c55e]'
                                : 'border-[#3d3d3d] hover:border-[#22c55e]'
                            }`}
                        aria-label={question.isSolved ? 'Mark as unsolved' : 'Mark as solved'}
                        aria-pressed={question.isSolved}
                    >
                        {question.isSolved && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Question Title - Flexible width with truncation */}
                <div className="flex-1 min-w-0 py-3 pr-12">
                    <span className={`text-sm truncate block ${question.isSolved
                        ? isLight ? 'text-gray-400' : 'text-gray-500'
                        : isLight ? 'text-gray-700' : 'text-gray-200'
                        }`}
                        title={question.title}
                    >
                        {question.title}
                    </span>
                </div>

                {/* LeetCode Icon - Fixed width */}
                <div className="w-12 flex-shrink-0 flex justify-center">
                    {question.url ? (
                        <a
                            href={question.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ffa116] hover:text-[#ffb84d] transition-colors"
                            title="Open on LeetCode"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Open problem on LeetCode"
                        >
                            <LeetCodeIcon className="w-5 h-5" />
                        </a>
                    ) : (
                        <span className="text-gray-600">
                            <LeetCodeIcon className="w-5 h-5" />
                        </span>
                    )}
                </div>

                {/* Difficulty - Fixed width */}
                <div className="w-24 flex-shrink-0 text-center">
                    <span className={`text-sm font-medium ${difficultyColor}`}>
                        {question.difficulty}
                    </span>
                </div>

                {/* YouTube Icon - Fixed width */}
                <div className="w-12 flex-shrink-0 flex justify-center">
                    {hasResource ? (
                        <a
                            href={question.resource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ff0000] hover:text-[#ff3333] transition-colors"
                            title="Watch video solution"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Watch video solution"
                        >
                            <YouTubeIcon className="w-6 h-6" />
                        </a>
                    ) : (
                        <span className="text-gray-600">
                            <YouTubeIcon className="w-6 h-6" />
                        </span>
                    )}
                </div>

                {/* Tags - Flexible width */}
                <div className="hidden md:flex w-48 lg:w-64 xl:w-80 flex-shrink-0 items-center justify-end gap-2 px-2 overflow-hidden mr-8">
                    {tags.slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap truncate max-w-[120px] ${isLight
                                ? 'border-gray-200 text-gray-600 bg-gray-50'
                                : 'border-[#3d3d3d] text-gray-400 bg-transparent'
                                }`}
                            title={tag}
                        >
                            {tag}
                        </span>
                    ))}
                    {tags.length > 3 && (
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            +{tags.length - 3}
                        </span>
                    )}
                </div>

                {/* Star Icon - Fixed width */}
                <div className="w-12 flex-shrink-0 flex justify-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleQuestionStarred(question.id)
                        }}
                        className={`${question.isStarred ? 'text-[#f59e0b]' : 'text-gray-500'} hover:text-[#f59e0b] transition-colors`}
                        title={question.isStarred ? "Remove from favorites" : "Add to favorites"}
                        aria-label={question.isStarred ? "Remove from favorites" : "Add to favorites"}
                    >
                        <StarIcon className={`w-5 h-5 ${question.isStarred ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Notes Icon - Fixed width */}
                <div className="w-12 flex-shrink-0 flex justify-center">
                    <button
                        onClick={(e) => { e.stopPropagation(); openModal('editQuestion', { topicId, subtopicId, question }) }}
                        className={`${question.notes ? 'text-[#6366f1]' : 'text-gray-500'} hover:text-[#6366f1] transition-colors`}
                        title="View/Edit notes"
                        aria-label="View or edit notes"
                    >
                        <NotesIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default QuestionItem
