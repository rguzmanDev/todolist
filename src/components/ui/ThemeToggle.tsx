'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/hooks/useTheme'

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex w-full items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-colors mb-1"
      style={{
        color: 'var(--color-sidebar-text)',
        background: 'var(--color-sidebar-hover)',
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={theme === 'light' ? 'Tema oscuro' : 'Tema claro'}
    >
      {theme === 'light' ? <Moon size={16} className="shrink-0" /> : <Sun size={16} className="shrink-0" />}
      {!collapsed && (theme === 'light' ? 'Oscuro' : 'Claro')}
    </button>
  )
}
