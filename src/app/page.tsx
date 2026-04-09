'use client'

import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import ContentHeader from '@/components/layout/ContentHeader'
import BookView from '@/components/views/BookView'
import SectionView from '@/components/views/SectionView'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const fetchBooks = useAppStore((s) => s.fetchBooks)
  const selectedSectionId = useAppStore((s) => s.selectedSectionId)

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ContentHeader />
        {selectedSectionId ? <SectionView /> : <BookView />}
      </div>
    </div>
  )
}
