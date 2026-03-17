'use client'

import { useState, useEffect, useTransition } from 'react'
import { Bell, ChevronDown, Building2 } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { setActiveLibrary } from '@/app/actions'

interface Library {
  id: string
  name: string
}

export default function AppHeader() {
  const [libraries, setLibraries] = useState<Library[]>([])
  const [currentLib, setCurrentLib] = useState<Library | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    async function fetchInitialData() {
      const { data: { user } } = await supabaseBrowser.auth.getUser()
      if (!user) return

      const { data: staff } = await supabaseBrowser
        .from('staff')
        .select('library_ids')
        .eq('user_id', user.id)
        .single()

      if (staff?.library_ids) {
        const { data: libs } = await supabaseBrowser
          .from('libraries')
          .select('id, name')
          .in('id', staff.library_ids)

        if (libs) {
          setLibraries(libs)
          setCurrentLib(libs[0])
          
          // Fetch unread notifications count
          const { count } = await supabaseBrowser
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('library_id', libs[0].id)
            .eq('is_read', false)
          
          setUnreadCount(count || 0)
        }
      }
      setLoading(false)
    }

    fetchInitialData()
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img 
          src="/icon.png" 
          alt="LibraryOS Icon" 
          className="w-9 h-9 rounded-xl shadow-lg shadow-brand-500/20 object-cover"
        />
        <div className="relative">
          <button 
            onClick={() => libraries.length > 1 && setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "flex flex-col items-start transition-all",
              libraries.length > 1 ? "cursor-pointer active:scale-95" : "cursor-default"
            )}
          >
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Branch</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 text-sm truncate max-w-[140px]">
                {loading ? 'Loading...' : (currentLib?.name || 'No Library')}
              </span>
              {libraries.length > 1 && <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                {libraries.map((lib) => (
                  <button
                    key={lib.id}
                    onClick={() => {
                      setCurrentLib(lib)
                      setIsDropdownOpen(false)
                      startTransition(async () => {
                        await setActiveLibrary(lib.id)
                        router.refresh()
                      })
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors",
                      currentLib?.id === lib.id ? "bg-brand-50 text-brand-700" : "text-gray-600"
                    )}
                  >
                    <Building2 className={cn("w-4 h-4", currentLib?.id === lib.id ? "text-brand-500" : "text-gray-400")} />
                    <span className="text-sm font-bold">{lib.name}</span>
                    {currentLib?.id === lib.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-brand-500 transition-colors rounded-xl hover:bg-gray-50">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100 uppercase">
            {loading ? '..' : (currentLib?.name.slice(0, 2) || 'OP')}
          </div>
        </div>
      </div>
    </header>
  )
}
