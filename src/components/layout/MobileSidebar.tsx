'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import { useTheme } from '@/lib/hooks/useTheme'
import Sidebar from './Sidebar'

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { theme } = useTheme()

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />

        {/* Drawer panel */}
        <Dialog.Content
          className="fixed left-0 top-0 z-50 h-full shadow-2xl outline-none
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left
            duration-300"
          style={{ backgroundColor: 'var(--color-sidebar-bg)' }}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Menú de navegación</Dialog.Title>
          <Sidebar onNavigate={onClose} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** Botón logo que abre el drawer en mobile */
export function MobileSidebarTrigger({ onClick }: { onClick: () => void }) {
  const { theme } = useTheme()
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-xl hover:opacity-75 transition-opacity md:hidden"
      aria-label="Abrir menú"
      style={{ width: 40, height: 40 }}
    >
      <Image
        src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
        alt="Folio"
        width={36}
        height={36}
        className="object-contain"
      />
    </button>
  )
}
