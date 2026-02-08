/**
 * SubtopicList Component
 * Renders list of subtopics with drag-and-drop support
 */

import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useStore } from '../store/useStore'
import SubtopicItem from './SubtopicItem'

function SubtopicList({ topic, openModal }) {
    const reorderSubtopics = useStore(state => state.reorderSubtopics)
    const theme = useStore(state => state.theme)

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            reorderSubtopics(topic.id, active.id, over.id)
        }
    }

    const isLight = theme === 'light'

    if (!topic.subtopics || topic.subtopics.length === 0) {
        return (
            <div className={`px-6 py-8 text-center text-sm ${isLight ? 'text-gray-500' : 'text-gray-600'}`}>
                No subtopics yet. Add one to get started.
            </div>
        )
    }

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={topic.subtopics.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div>
                    {topic.subtopics.map((subtopic) => (
                        <SubtopicItem
                            key={subtopic.id}
                            subtopic={subtopic}
                            topicId={topic.id}
                            openModal={openModal}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}

export default SubtopicList
