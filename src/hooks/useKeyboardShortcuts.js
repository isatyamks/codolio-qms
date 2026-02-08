/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard shortcuts for power-user navigation
 */

import { useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'

// ============================================================================
// Constants
// ============================================================================

/**
 * Keyboard shortcuts configuration for help display
 * Keys array uses platform-agnostic naming (Mod = Ctrl/Cmd)
 */
export const KEYBOARD_SHORTCUTS = Object.freeze([
    { keys: ['Mod', 'K'], description: 'Focus search bar' },
    { keys: ['Mod', 'N'], description: 'Add new topic' },
    { keys: ['Mod', 'E'], description: 'Expand all topics' },
    { keys: ['Mod', 'W'], description: 'Collapse all topics' },
    { keys: ['T'], description: 'Toggle dark/light theme' },
    { keys: ['S'], description: 'Toggle statistics panel' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['Esc'], description: 'Close modal' },
])

/**
 * Detect if running on Mac for modifier key display
 */
export const IS_MAC = typeof navigator !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform)

/**
 * Get the modifier key label for the current platform
 */
export function getModifierKey() {
    return IS_MAC ? '⌘' : 'Ctrl'
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcutKeys(keys) {
    return keys.map(key => key === 'Mod' ? getModifierKey() : key)
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Elements that should not trigger keyboard shortcuts
 */
const INTERACTIVE_ELEMENTS = ['INPUT', 'TEXTAREA', 'SELECT']

/**
 * Check if the current target should block keyboard shortcuts
 */
function shouldBlockShortcut(target) {
    if (!target) return false

    // Check tag name
    if (INTERACTIVE_ELEMENTS.includes(target.tagName)) {
        return true
    }

    // Check contenteditable
    if (target.isContentEditable) {
        return true
    }

    // Check if inside a contenteditable parent
    if (target.closest('[contenteditable="true"]')) {
        return true
    }

    return false
}

/**
 * Keyboard shortcuts hook
 * @param {Function} openModal - Function to open modal with type and data
 */
export function useKeyboardShortcuts(openModal) {
    const expandAllTopics = useStore(state => state.expandAllTopics)
    const collapseAllTopics = useStore(state => state.collapseAllTopics)
    const toggleTheme = useStore(state => state.toggleTheme)
    const toggleStats = useStore(state => state.toggleStats)

    const handleKeyDown = useCallback((event) => {
        // Don't trigger shortcuts when typing in interactive elements
        if (shouldBlockShortcut(event.target)) {
            return
        }

        const key = event.key.toLowerCase()
        const hasModifier = event.ctrlKey || event.metaKey

        // Modifier + key combinations
        if (hasModifier) {
            switch (key) {
                case 'k': {
                    // Mod+K: Focus search
                    event.preventDefault()
                    const searchInput = document.querySelector('[data-search-input]')
                    searchInput?.focus()
                    break
                }
                case 'n': {
                    // Mod+N: Add new topic
                    event.preventDefault()
                    openModal('addTopic')
                    break
                }
                case 'e': {
                    // Mod+E: Expand all
                    event.preventDefault()
                    expandAllTopics()
                    break
                }
                case 'w': {
                    // Mod+W: Collapse all (prevent browser tab close)
                    event.preventDefault()
                    collapseAllTopics()
                    break
                }
                default:
                    // No matching shortcut
                    break
            }
            return
        }

        // Single key shortcuts (no modifier)
        switch (event.key) {
            case '?': {
                event.preventDefault()
                openModal('shortcuts')
                break
            }
            case 't':
            case 'T': {
                // Toggle theme (works with both cases)
                event.preventDefault()
                toggleTheme()
                break
            }
            case 's':
            case 'S': {
                // Toggle statistics panel
                event.preventDefault()
                toggleStats()
                break
            }
            default:
                // No matching shortcut
                break
        }
    }, [expandAllTopics, collapseAllTopics, toggleTheme, toggleStats, openModal])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown])
}
