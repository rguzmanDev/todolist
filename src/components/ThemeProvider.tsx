'use client'

import { ReactNode } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'

/**
 * Componente que inicializa y maneja el tema de la aplicación
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useTheme()
  return children
}
