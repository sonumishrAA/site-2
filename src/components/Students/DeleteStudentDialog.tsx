'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DeleteStudentDialogProps {
  isOpen: boolean
  onClose: () => void
  student: { id: string; name: string; seat_number?: string } | null
}

export default function DeleteStudentDialog({ isOpen, onClose, student }: DeleteStudentDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (!isOpen || !student) return null

  const handleDelete = async () => {
    setLoading(true)
    try {
      // 1. Physical delete the student (shifts will cascade delete automatically)
      const { error: studentError } = await supabaseBrowser
        .from('students')
        .delete()
        .eq('id', student.id)

      if (studentError) throw studentError

      router.refresh()
      onClose()
    } catch (err: any) {
      alert('Error deleting student: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mb-2">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-xl font-serif text-brand-900 leading-tight">Remove Student?</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to remove <span className="font-bold text-gray-900">{student.name}</span> from seat <span className="font-bold text-brand-600">{student.seat_number}</span>?
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 pt-4">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Remove Student'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
