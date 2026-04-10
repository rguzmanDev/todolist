'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import type { ThemeMode } from '@/lib/theme'

/**
 * Hook para manejar el tema de la aplicación
 * Aplica el tema al atributo data-theme del html
 */
export function useTheme() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)

  /**
   * Efecto para aplicar el tema al cambiar
   */
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', theme)
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('folio-theme', theme)
  }, [theme])

  /**
   * Inicializar tema desde localStorage o preferencia del sistema
   */
  useEffect(() => {
    const saved = localStorage.getItem('folio-theme') as ThemeMode | null
    if (saved) {
      setTheme(saved)
      return
    }

    // Detectar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }, [setTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}
