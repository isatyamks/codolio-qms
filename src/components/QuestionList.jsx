/**
 * QuestionList Component
 * Renders filtered list of questions with drag-and-drop support
 */

import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useStore, filterQuestions, FILTER_ALL } from '../store/useStore'
import QuestionItem from './QuestionItem'

function QuestionList({ questions, topicId, subtopicId, openModal }) {
    const reorderQuestions = useStore(state => state.reorderQuestions)
    const searchQuery = useStore(state => state.searchQuery)
    const filterDifficulty = useStore(state => state.filterDifficulty)
    const filterStatus = useStore(state => state.filterStatus)
    const theme = useStore(state => state.theme)

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            reorderQuestions(topicId, subtopicId, active.id, over.id)
        }
    }

    // Apply filters
    const filteredQuestions = filterQuestions(questions, searchQuery, filterDifficulty, filterStatus)
    const hasFilters = searchQuery || filterDifficulty !== FILTER_ALL || filterStatus !== FILTER_ALL
    const isLight = theme === 'light'

    if (filteredQuestions.length === 0) {
        return (
            <div className={`px-8 py-6 text-center text-sm ${isLight ? 'text-gray-500' : 'text-gray-600'}`}>
                {hasFilters ? 'No questions match the current filters' : 'No questions yet'}
            </div>
        )
    }

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredQuestions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                <div>
                    {filteredQuestions.map((question) => (
                        <QuestionItem
                            key={question.id}
                            question={question}
                            topicId={topicId}
                            subtopicId={subtopicId}
                            openModal={openModal}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}

export default QuestionList
