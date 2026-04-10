'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/hooks/useTheme'
import { THEME } from '@/lib/theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 mb-2"
      style={{
        color: THEME.ui.text.tertiary,
        background: THEME.ui.sidebar.hover,
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <Moon size={16} />
          Oscuro
        </>
      ) : (
        <>
          <Sun size={16} />
          Claro
        </>
      )}
    </button>
  )
}
