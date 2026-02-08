/**
 * Main Application Component
 * Orchestrates the question sheet management interface
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import {
  useStore,
  calculateTotalProgress,
  THEME_LIGHT,
  THEME_DARK
} from './store/useStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import Header from './components/Header'
import TopicList from './components/TopicList'
import SearchBar from './components/SearchBar'
import StatsPanel from './components/StatsPanel'
import Modal from './components/Modal'
import './App.css'

// ============================================================================
// Theme Utilities
// ============================================================================

function getThemeClasses(theme, variant) {
  const isLight = theme === THEME_LIGHT

  const classes = {
    background: isLight ? 'bg-gray-100' : 'bg-[#0f0f0f]',
    text: isLight ? 'text-gray-600' : 'text-gray-400',
    textMuted: isLight ? 'text-gray-500' : 'text-gray-600',
    spinner: isLight ? 'border-gray-300 border-t-[#6366f1]' : 'border-[#333] border-t-[#6366f1]',
    kbd: isLight ? 'bg-gray-200' : 'bg-[#252525]',
  }

  return variant ? classes[variant] : classes
}

// ============================================================================
// Loading State Component
// ============================================================================

function LoadingScreen({ theme }) {
  const classes = getThemeClasses(theme)

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center gap-4 ${classes.background}`}
      role="status"
      aria-label="Loading"
    >
      <div
        className={`w-12 h-12 border-4 ${classes.spinner} rounded-full animate-spin`}
        aria-hidden="true"
      />
      <p className={`text-lg ${classes.text}`}>Loading sheet data...</p>
    </div>
  )
}

// ============================================================================
// Error State Component
// ============================================================================

function ErrorScreen({ theme, error, onRetry }) {
  const classes = getThemeClasses(theme)

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center gap-4 ${classes.background}`}
      role="alert"
    >
      <div className="text-red-500 text-6xl" aria-hidden="true">⚠️</div>
      <p className="text-red-400 text-lg">Error: {error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-[#6366f1] hover:bg-indigo-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Retry
      </button>
    </div>
  )
}

// ============================================================================
// Main App Component
// ============================================================================

function App() {
  // Store selectors - kept minimal to prevent unnecessary re-renders
  const loading = useStore(state => state.loading)
  const error = useStore(state => state.error)
  const topics = useStore(state => state.topics)
  const theme = useStore(state => state.theme)
  const fetchSheetData = useStore(state => state.fetchSheetData)
  const reorderTopics = useStore(state => state.reorderTopics)

  // Derived state
  const progress = calculateTotalProgress(topics)

  // Local state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null
  })

  // Refs
  const initialized = useRef(false)

  // DnD sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Modal handlers
  const openModal = useCallback((type, data = null) => {
    setModalState({ isOpen: true, type, data })
  }, [])

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, type: null, data: null })
  }, [])

  // Initialize keyboard shortcuts
  useKeyboardShortcuts(openModal)

  // Data initialization - runs once on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      fetchSheetData()
    }
  }, [fetchSheetData])

  // Theme application to document root
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('light-theme', theme === THEME_LIGHT)

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === THEME_LIGHT ? '#f3f4f6' : '#0f0f0f'
      )
    }
  }, [theme])

  // DnD event handler
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event

    if (!active || !over || active.id === over.id) {
      return
    }

    const activeType = active.data.current?.type
    if (activeType === 'topic') {
      reorderTopics(active.id, over.id)
    }
  }, [reorderTopics])

  // Render loading state
  if (loading) {
    return <LoadingScreen theme={theme} />
  }

  // Render error state
  if (error) {
    return (
      <ErrorScreen
        theme={theme}
        error={error}
        onRetry={fetchSheetData}
      />
    )
  }

  const classes = getThemeClasses(theme)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${classes.background}`}>
      <Header
        progress={progress}
        onAddTopic={() => openModal('addTopic')}
        openModal={openModal}
      />

      <main className="w-[95%] max-w-[1800px] mx-auto py-6">
        <SearchBar />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={topics.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <TopicList topics={topics} openModal={openModal} />
          </SortableContext>
        </DndContext>
      </main>

      <StatsPanel />
      <Modal modalState={modalState} closeModal={closeModal} />

      {/* Keyboard shortcut hint - accessible */}
      <div
        className={`fixed bottom-4 right-4 text-xs ${classes.textMuted}`}
        aria-label="Press question mark for keyboard shortcuts"
      >
        Press{' '}
        <kbd className={`px-1.5 py-0.5 ${classes.kbd} rounded font-mono`}>
          ?
        </kbd>{' '}
        for shortcuts
      </div>
    </div>
  )
}

export default App
