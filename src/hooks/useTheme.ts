// ============================================================
// useTheme Hook
// Theme management with system preference support
// ============================================================

import { useEffect, useCallback } from 'react'
import { useSettingsStore } from '@/stores/settings'

export function useTheme() {
  const { theme, setTheme } = useSettingsStore()

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (themeValue: 'light' | 'dark' | 'system') => {
      let effectiveTheme: 'light' | 'dark'

      if (themeValue === 'system') {
        effectiveTheme = mediaQuery.matches ? 'dark' : 'light'
      } else {
        effectiveTheme = themeValue
      }

      root.classList.remove('light', 'dark')
      root.classList.add(effectiveTheme)

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          effectiveTheme === 'dark' ? '#0f172a' : '#ffffff'
        )
      }
    }

    applyTheme(theme)

    // Listen for system theme changes
    const handler = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(nextTheme)
  }, [theme, setTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
  }
}
