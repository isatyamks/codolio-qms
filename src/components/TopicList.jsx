/**
 * TopicList Component
 * Renders the list of topics with empty state
 */

import { useStore } from '../store/useStore'
import TopicItem from './TopicItem'

function TopicList({ topics, openModal }) {
    const theme = useStore(state => state.theme)
    const isLight = theme === 'light'

    if (!topics || topics.length === 0) {
        return (
            <div className="text-center py-16">
                <div className={`text-6xl mb-4 ${isLight ? 'text-gray-400' : 'text-gray-600'}`} aria-hidden="true">
                    📋
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                    No topics yet
                </h3>
                <p className={isLight ? 'text-gray-500' : 'text-gray-500'}>
                    Add your first topic to get started
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-1">
            {topics.map((topic) => (
                <TopicItem key={topic.id} topic={topic} openModal={openModal} />
            ))}
        </div>
    )
}

export default TopicList
