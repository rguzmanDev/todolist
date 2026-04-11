'use client'

import { ReactNode } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'
import Toaster from '@/components/ui/Toaster'

export function ThemeProvider({ children }: { children: ReactNode }) {
  useTheme()
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
