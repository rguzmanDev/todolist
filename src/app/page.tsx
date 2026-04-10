'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import MobileSidebar from '@/components/layout/MobileSidebar'
import ContentHeader from '@/components/layout/ContentHeader'
import BookView from '@/components/views/BookView'
import SectionView from '@/components/views/SectionView'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const fetchBooks = useAppStore((s) => s.fetchBooks)
  const selectedSectionId = useAppStore((s) => s.selectedSectionId)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <ContentHeader onMenuOpen={() => setMobileOpen(true)} />
        {selectedSectionId ? <SectionView /> : <BookView />}
      </div>
    </div>
  )
}
