/**
 * SubtopicItem Component
 * Displays subtopic header with progress and expandable question list
 * UI matches the Codolio design reference
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore, calculateSubtopicProgress } from '../store/useStore'
import QuestionList from './QuestionList'

// ============================================================================
// Icon Components
// ============================================================================

function ChevronIcon({ className, isExpanded }) {
    return (
        <svg
            className={`${className} transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

function PlusIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    )
}

function EditIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    )
}

function TrashIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    )
}

// ============================================================================
// Main Component
// ============================================================================

function SubtopicItem({ subtopic, topicId, openModal }) {
    const expandedSubtopics = useStore(state => state.expandedSubtopics)
    const toggleSubtopicExpansion = useStore(state => state.toggleSubtopicExpansion)
    const theme = useStore(state => state.theme)

    const isExpanded = expandedSubtopics[subtopic.id]
    const progress = calculateSubtopicProgress(subtopic)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: subtopic.id,
        data: { type: 'subtopic', subtopic, topicId }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const isLight = theme === 'light'

    const handleToggle = () => {
        toggleSubtopicExpansion(subtopic.id)
    }

    return (
        <div ref={setNodeRef} style={style}>
            <div className="group">
                {/* Subtopic Header - Matches reference design */}
                <div
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isLight
                            ? 'bg-gray-50 hover:bg-gray-100 border-b border-gray-200'
                            : 'bg-[#161616] hover:bg-[#1a1a1a] border-b border-[#252525]'
                        }`}
                    onClick={handleToggle}
                    role="button"
                    aria-expanded={isExpanded}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleToggle()
                        }
                    }}
                >
                    {/* Drag Handle - visible on hover */}
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 text-gray-600 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Drag to reorder"
                    >
                        <DragHandleIcon className="w-4 h-4" />
                    </button>

                    {/* Subtopic Name */}
                    <span className={`font-medium text-sm ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
                        {subtopic.name}
                    </span>

                    {/* Progress Count */}
                    <span className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-500'} ml-2`}>
                        {progress.solved} / {progress.total}
                    </span>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Action Buttons - visible on hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                openModal('addQuestion', { topicId, subtopicId: subtopic.id })
                            }}
                            className="p-1.5 text-gray-500 hover:text-[#6366f1] transition-colors rounded"
                            title="Add Question"
                            aria-label="Add question to this subtopic"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                openModal('editSubtopic', { topicId, subtopic })
                            }}
                            className="p-1.5 text-gray-500 hover:text-[#f59e0b] transition-colors rounded"
                            title="Edit Subtopic"
                            aria-label="Edit subtopic"
                        >
                            <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                openModal('deleteSubtopic', { topicId, subtopic })
                            }}
                            className="p-1.5 text-gray-500 hover:text-[#ef4444] transition-colors rounded"
                            title="Delete Subtopic"
                            aria-label="Delete subtopic"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Expand/Collapse Chevron - on the right like in reference */}
                    <ChevronIcon
                        className={`w-5 h-5 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}
                        isExpanded={isExpanded}
                    />
                </div>

                {/* Questions List */}
                {isExpanded && (
                    <div className={`animate-slideIn ${isLight ? 'bg-white' : 'bg-[#121212]'}`}>
                        <QuestionList
                            questions={subtopic.questions}
                            topicId={topicId}
                            subtopicId={subtopic.id}
                            openModal={openModal}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default SubtopicItem
