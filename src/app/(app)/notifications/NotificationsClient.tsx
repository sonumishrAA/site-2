'use client'

import { Bell, CheckCheck, UserPlus, CreditCard, RefreshCcw, AlertTriangle, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { markAllNotificationsRead } from './actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const getIcon = (type: string) => {
  switch (type) {
    case 'new_admission': return <UserPlus className="w-4 h-4 text-green-500" />
    case 'fee_collected': return <CreditCard className="w-4 h-4 text-blue-500" />
    case 'student_renewed': return <RefreshCcw className="w-4 h-4 text-purple-500" />
    case 'seat_changed': return <Edit className="w-4 h-4 text-brand-500" />
    case 'data_cleanup_warning': return <Trash2 className="w-4 h-4 text-red-500" />
    case 'expiry_warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />
    default: return <Bell className="w-4 h-4 text-gray-500" />
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function NotificationsClient({ notifications, libraryId }: { notifications: any[], libraryId: string }) {
  const router = useRouter()
  const [marking, setMarking] = useState(false)

  const handleMarkAllRead = async () => {
    setMarking(true)
    await markAllNotificationsRead(libraryId)
    router.refresh()
    setMarking(false)
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-brand-900 leading-tight">Notifications</h1>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            disabled={marking}
            className="flex items-center gap-1.5 text-brand-500 font-bold text-xs uppercase tracking-widest hover:underline disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            {marking ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif: any) => (
            <div 
              key={notif.id} 
              className={cn(
                "p-4 rounded-2xl border transition-all",
                notif.is_read 
                  ? 'bg-white border-gray-100 opacity-70' 
                  : 'bg-white border-brand-100 shadow-sm shadow-brand-50 ring-1 ring-brand-50'
              )}
              style={{ animation: 'fadeInUp 0.3s ease-out both' }}
            >
              <div className="flex gap-4">
                <div className="mt-1 shrink-0">
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{notif.title}</h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0 ml-2">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-normal">{notif.message}</p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 italic font-medium">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
