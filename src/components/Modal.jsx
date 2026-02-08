/**
 * Modal Component
 * Handles all dialogs for CRUD operations, shortcuts help, and confirmations
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore, DIFFICULTY_LEVELS } from '../store/useStore'
import { KEYBOARD_SHORTCUTS, formatShortcutKeys } from '../hooks/useKeyboardShortcuts'

// ============================================================================
// Modal Type Constants
// ============================================================================

const MODAL_TYPES = Object.freeze({
    ADD_TOPIC: 'addTopic',
    EDIT_TOPIC: 'editTopic',
    DELETE_TOPIC: 'deleteTopic',
    ADD_SUBTOPIC: 'addSubtopic',
    EDIT_SUBTOPIC: 'editSubtopic',
    DELETE_SUBTOPIC: 'deleteSubtopic',
    ADD_QUESTION: 'addQuestion',
    EDIT_QUESTION: 'editQuestion',
    DELETE_QUESTION: 'deleteQuestion',
    RESET_PROGRESS: 'resetProgress',
    SHORTCUTS: 'shortcuts',
})

const MODAL_TITLES = Object.freeze({
    [MODAL_TYPES.ADD_TOPIC]: 'Add Topic',
    [MODAL_TYPES.EDIT_TOPIC]: 'Edit Topic',
    [MODAL_TYPES.DELETE_TOPIC]: 'Delete Topic',
    [MODAL_TYPES.ADD_SUBTOPIC]: 'Add Subtopic',
    [MODAL_TYPES.EDIT_SUBTOPIC]: 'Edit Subtopic',
    [MODAL_TYPES.DELETE_SUBTOPIC]: 'Delete Subtopic',
    [MODAL_TYPES.ADD_QUESTION]: 'Add Question',
    [MODAL_TYPES.EDIT_QUESTION]: 'Edit Question',
    [MODAL_TYPES.DELETE_QUESTION]: 'Delete Question',
    [MODAL_TYPES.RESET_PROGRESS]: 'Reset Progress',
    [MODAL_TYPES.SHORTCUTS]: 'Keyboard Shortcuts',
})

// ============================================================================
// Helper Functions
// ============================================================================

function getInitialFormData(type, data) {
    switch (type) {
        case MODAL_TYPES.EDIT_TOPIC:
            return { name: data?.topic?.name || '' }
        case MODAL_TYPES.EDIT_SUBTOPIC:
            return { name: data?.subtopic?.name || '' }
        case MODAL_TYPES.EDIT_QUESTION:
            return {
                title: data?.question?.title || '',
                difficulty: data?.question?.difficulty || DIFFICULTY_LEVELS.MEDIUM,
                url: data?.question?.url || '',
                notes: data?.question?.notes || '',
            }
        case MODAL_TYPES.ADD_QUESTION:
            return { title: '', difficulty: DIFFICULTY_LEVELS.MEDIUM, url: '', notes: '' }
        default:
            return { name: '' }
    }
}

function isDeleteType(type) {
    return type?.includes('delete') || type === MODAL_TYPES.RESET_PROGRESS
}

function isQuestionType(type) {
    return type?.includes('Question')
}

function getDeleteItemName(data) {
    return data?.topic?.name || data?.subtopic?.name || data?.question?.title || 'this item'
}

// ============================================================================
// Sub-Components
// ============================================================================

function CloseButton({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            aria-label="Close modal"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    )
}

function ShortcutsContent({ onClose }) {
    return (
        <div className="space-y-3">
            {KEYBOARD_SHORTCUTS.map((shortcut, idx) => {
                const formattedKeys = formatShortcutKeys(shortcut.keys)
                return (
                    <div key={idx} className="flex items-center justify-between py-2">
                        <span className="text-gray-300">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                            {formattedKeys.map((key, keyIdx) => (
                                <span key={keyIdx} className="flex items-center">
                                    <kbd className="px-2 py-1 bg-[#252525] border border-[#444] rounded text-sm text-gray-300 font-mono">
                                        {key}
                                    </kbd>
                                    {keyIdx < formattedKeys.length - 1 && (
                                        <span className="text-gray-500 mx-1">+</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                )
            })}
            <div className="pt-4 text-center">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-[#6366f1] hover:bg-indigo-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
                >
                    Got it!
                </button>
            </div>
        </div>
    )
}

function ResetConfirmContent({ onClose, onConfirm }) {
    return (
        <>
            <div className="text-center mb-6">
                <div className="text-5xl mb-4" aria-hidden="true">⚠️</div>
                <p className="text-gray-300">
                    This will reset all your progress and reload the original data.
                    <span className="text-red-400 font-medium"> This cannot be undone!</span>
                </p>
            </div>
            <div className="flex items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="px-5 py-2 bg-[#ef4444] hover:bg-red-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
                >
                    Reset Everything
                </button>
            </div>
        </>
    )
}

function DeleteConfirmContent({ itemName }) {
    return (
        <p className="text-gray-300 mb-6">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">{itemName}</span>?
            This action cannot be undone.
        </p>
    )
}

function QuestionForm({ formData, setFormData }) {
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="question-title" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Title <span className="text-red-400">*</span>
                </label>
                <input
                    id="question-title"
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#252525] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors"
                    placeholder="Enter question title"
                    autoFocus
                    required
                />
            </div>
            <div>
                <label htmlFor="question-difficulty" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Difficulty
                </label>
                <select
                    id="question-difficulty"
                    value={formData.difficulty || DIFFICULTY_LEVELS.MEDIUM}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#252525] border border-[#333] rounded-lg text-white focus:outline-none focus:border-[#6366f1] transition-colors cursor-pointer"
                >
                    <option value={DIFFICULTY_LEVELS.EASY}>{DIFFICULTY_LEVELS.EASY}</option>
                    <option value={DIFFICULTY_LEVELS.MEDIUM}>{DIFFICULTY_LEVELS.MEDIUM}</option>
                    <option value={DIFFICULTY_LEVELS.HARD}>{DIFFICULTY_LEVELS.HARD}</option>
                </select>
            </div>
            <div>
                <label htmlFor="question-url" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Problem URL (optional)
                </label>
                <input
                    id="question-url"
                    type="url"
                    value={formData.url || ''}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#252525] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors"
                    placeholder="https://leetcode.com/problems/..."
                />
            </div>
            <div>
                <label htmlFor="question-notes" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Notes
                </label>
                <textarea
                    id="question-notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#252525] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors resize-y min-h-[100px]"
                    placeholder="Add your notes, approach, or key learnings..."
                />
            </div>
        </div>
    )
}

function NameForm({ formData, setFormData, placeholder }) {
    return (
        <div>
            <label htmlFor="item-name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Name <span className="text-red-400">*</span>
            </label>
            <input
                id="item-name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#252525] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors"
                placeholder={placeholder}
                autoFocus
                required
            />
        </div>
    )
}

function FormActions({ isDelete, onCancel }) {
    return (
        <div className="flex items-center justify-end gap-3 mt-6">
            <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                className={`px-5 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] ${isDelete
                    ? 'bg-[#ef4444] hover:bg-red-600 text-white focus:ring-red-500'
                    : 'bg-[#6366f1] hover:bg-indigo-600 text-white focus:ring-indigo-500'
                    }`}
            >
                {isDelete ? 'Delete' : 'Save'}
            </button>
        </div>
    )
}

// ============================================================================
// Main Modal Component
// ============================================================================

function Modal({ modalState, closeModal }) {
    const { isOpen, type, data } = modalState
    const modalRef = useRef(null)
    const previousActiveElement = useRef(null)

    // Store actions
    const addTopic = useStore(state => state.addTopic)
    const updateTopic = useStore(state => state.updateTopic)
    const deleteTopic = useStore(state => state.deleteTopic)
    const addSubtopic = useStore(state => state.addSubtopic)
    const updateSubtopic = useStore(state => state.updateSubtopic)
    const deleteSubtopic = useStore(state => state.deleteSubtopic)
    const addQuestion = useStore(state => state.addQuestion)
    const updateQuestion = useStore(state => state.updateQuestion)
    const deleteQuestion = useStore(state => state.deleteQuestion)
    const resetProgress = useStore(state => state.resetProgress)

    const [formData, setFormData] = useState({})

    // Initialize form data when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData(type, data))
        }
    }, [isOpen, type, data])

    // Handle escape key
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                closeModal()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, closeModal])

    // Focus management
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement
            // Focus first focusable element in modal
            const firstFocusable = modalRef.current?.querySelector(
                'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            firstFocusable?.focus()
        } else if (previousActiveElement.current) {
            previousActiveElement.current.focus()
        }
    }, [isOpen])

    // Form submission handler
    const handleSubmit = useCallback((e) => {
        e.preventDefault()

        switch (type) {
            case MODAL_TYPES.ADD_TOPIC:
                if (formData.name?.trim()) {
                    addTopic(formData.name.trim())
                    closeModal()
                }
                break
            case MODAL_TYPES.EDIT_TOPIC:
                if (formData.name?.trim() && data?.topic?.id) {
                    updateTopic(data.topic.id, formData.name.trim())
                    closeModal()
                }
                break
            case MODAL_TYPES.DELETE_TOPIC:
                if (data?.topic?.id) {
                    deleteTopic(data.topic.id)
                    closeModal()
                }
                break
            case MODAL_TYPES.ADD_SUBTOPIC:
                if (formData.name?.trim() && data?.topicId) {
                    addSubtopic(data.topicId, formData.name.trim())
                    closeModal()
                }
                break
            case MODAL_TYPES.EDIT_SUBTOPIC:
                if (formData.name?.trim() && data?.topicId && data?.subtopic?.id) {
                    updateSubtopic(data.topicId, data.subtopic.id, formData.name.trim())
                    closeModal()
                }
                break
            case MODAL_TYPES.DELETE_SUBTOPIC:
                if (data?.topicId && data?.subtopic?.id) {
                    deleteSubtopic(data.topicId, data.subtopic.id)
                    closeModal()
                }
                break
            case MODAL_TYPES.ADD_QUESTION:
                if (formData.title?.trim() && data?.topicId && data?.subtopicId) {
                    addQuestion(data.topicId, data.subtopicId, {
                        title: formData.title.trim(),
                        difficulty: formData.difficulty,
                        url: formData.url?.trim() || '',
                        notes: formData.notes?.trim() || '',
                    })
                    closeModal()
                }
                break
            case MODAL_TYPES.EDIT_QUESTION:
                if (formData.title?.trim() && data?.topicId && data?.subtopicId && data?.question?.id) {
                    updateQuestion(data.topicId, data.subtopicId, data.question.id, {
                        title: formData.title.trim(),
                        difficulty: formData.difficulty,
                        url: formData.url?.trim() || '',
                        notes: formData.notes?.trim() || '',
                    })
                    closeModal()
                }
                break
            case MODAL_TYPES.DELETE_QUESTION:
                if (data?.topicId && data?.subtopicId && data?.question?.id) {
                    deleteQuestion(data.topicId, data.subtopicId, data.question.id)
                    closeModal()
                }
                break
            default:
                closeModal()
        }
    }, [type, formData, data, addTopic, updateTopic, deleteTopic, addSubtopic, updateSubtopic, deleteSubtopic, addQuestion, updateQuestion, deleteQuestion, closeModal])

    const handleResetConfirm = useCallback(() => {
        resetProgress()
        closeModal()
    }, [resetProgress, closeModal])

    if (!isOpen) return null

    const title = MODAL_TITLES[type] || 'Modal'
    const isDelete = isDeleteType(type)
    const isQuestion = isQuestionType(type)
    const isShortcuts = type === MODAL_TYPES.SHORTCUTS
    const isReset = type === MODAL_TYPES.RESET_PROGRESS

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeModal}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className="relative w-full max-w-md mx-4 bg-[#1a1a1a] rounded-xl border border-[#333] shadow-2xl animate-slideIn"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
                    <h2 id="modal-title" className="text-lg font-semibold text-white flex items-center gap-2">
                        {isShortcuts && (
                            <svg className="w-5 h-5 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        )}
                        {title}
                    </h2>
                    <CloseButton onClick={closeModal} />
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {isShortcuts ? (
                        <ShortcutsContent onClose={closeModal} />
                    ) : isReset ? (
                        <ResetConfirmContent onClose={closeModal} onConfirm={handleResetConfirm} />
                    ) : isDelete ? (
                        <>
                            <DeleteConfirmContent itemName={getDeleteItemName(data)} />
                            <FormActions isDelete onCancel={closeModal} />
                        </>
                    ) : isQuestion ? (
                        <>
                            <QuestionForm formData={formData} setFormData={setFormData} />
                            <FormActions isDelete={false} onCancel={closeModal} />
                        </>
                    ) : (
                        <>
                            <NameForm
                                formData={formData}
                                setFormData={setFormData}
                                placeholder={type?.includes('Topic') ? 'Enter topic name' : 'Enter subtopic name'}
                            />
                            <FormActions isDelete={false} onCancel={closeModal} />
                        </>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Modal
