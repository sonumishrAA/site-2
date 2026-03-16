'use client'

import { PlusCircle, ExternalLink } from 'lucide-react'

export default function AddLibraryCard() {
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center space-y-4">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
        <PlusCircle className="w-8 h-8 text-brand-500" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-gray-900">Add Another Library</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Run multiple branches from one account. Each library has its own subscription and data.
        </p>
      </div>
      <button
        onClick={() => window.open('https://libraryos-lms.vercel.app/library-register?existing_owner=true', '_blank')}
        className="inline-flex items-center gap-2 bg-white border border-brand-500 text-brand-500 px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-brand-500 hover:text-white transition-all shadow-sm active:scale-95"
      >
        Register New Library
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  )
}
