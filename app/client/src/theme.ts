import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

// The source of truth is data-theme on <html>. index.html sets it before the first paint.
const root = document.documentElement

function getTheme(): Theme {
  return root.dataset.theme === 'dark' ? 'dark' : 'light'
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export function setTheme(theme: Theme) {
  root.dataset.theme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // Storage can be blocked; the theme still applies for this visit.
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme)
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  return { theme, toggle }
}
