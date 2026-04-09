'use client'

import { BOOK_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { BookColor } from '@/lib/constants'

interface ColorPickerProps {
  value: string
  onChange: (color: BookColor) => void
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {BOOK_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            'h-7 w-7 rounded-full transition-transform hover:scale-110',
            value === color && 'ring-2 ring-offset-2 ring-gray-900 scale-110'
          )}
          style={{ backgroundColor: color }}
          aria-label={color}
          aria-pressed={value === color}
        />
      ))}
    </div>
  )
}
