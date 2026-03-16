'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setMounted(true)
    } else {
      document.body.style.overflow = 'unset'
      setTimeout(() => setMounted(false), 300)
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted && !isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 transform",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-3" />
        
        {title && (
          <div className="px-6 py-2 flex items-center justify-between">
            <h2 className="text-xl font-serif text-brand-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        <div className="p-6 pt-2 pb-safe-bottom max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  )
}
