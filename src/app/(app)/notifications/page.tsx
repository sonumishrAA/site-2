'use client'

import { Bell, CheckCheck, UserPlus, CreditCard, RefreshCcw, AlertTriangle } from 'lucide-react'

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'student_renewed', title: 'Plan Renewed', message: 'Rahul Kumar renewed his plan for 3 months.', time: '2 hours ago', is_read: false },
  { id: '2', type: 'expiry_warning', title: 'Expiring Soon', message: 'Vikash Yadav is expiring in 4 days.', time: '5 hours ago', is_read: false },
  { id: '3', type: 'fee_collected', title: 'Fee Collected', message: '₹2,500 collected from Priya Kumari by Staff.', time: '1 day ago', is_read: true },
  { id: '4', type: 'new_admission', title: 'New Admission', message: 'Arjun Sharma admitted to seat M7.', time: '2 days ago', is_read: true },
]

export default function NotificationsPage() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'new_admission': return <UserPlus className="w-4 h-4 text-green-500" />
      case 'fee_collected': return <CreditCard className="w-4 h-4 text-blue-500" />
      case 'student_renewed': return <RefreshCcw className="w-4 h-4 text-purple-500" />
      case 'expiry_warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />
      default: return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-brand-900 leading-tight">Notifications</h1>
        <button className="flex items-center gap-1.5 text-brand-500 font-bold text-xs uppercase tracking-widest hover:underline">
          <CheckCheck className="w-4 h-4" />
          Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_NOTIFICATIONS.map((notif) => (
          <div 
            key={notif.id} 
            className={`p-4 rounded-2xl border transition-all ${
              notif.is_read 
                ? 'bg-white border-gray-100 opacity-70' 
                : 'bg-white border-brand-100 shadow-sm shadow-brand-50 ring-1 ring-brand-50'
            }`}
          >
            <div className="flex gap-4">
              <div className="mt-1 shrink-0">
                <div className={`p-2 rounded-xl bg-gray-50 border border-gray-100`}>
                  {getIcon(notif.type)}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{notif.title}</h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{notif.time}</span>
                </div>
                <p className="text-xs text-gray-600 leading-normal">{notif.message}</p>
              </div>
              {!notif.is_read && (
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
