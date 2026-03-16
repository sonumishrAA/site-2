import ExpiredStudentsCard from '@/components/Dashboard/ExpiredStudentsCard'
import { Users, Grid, CreditCard, Clock, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { daysUntil } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get library context
  const { data: staff } = await supabase
    .from('staff')
    .select('library_ids')
    .eq('user_id', user.id)
    .single()

  const libraryId = staff?.library_ids?.[0]
  if (!libraryId) return <div>No library assigned.</div>
// Parallel data fetching for stats
const today = new Date().toISOString().split('T')[0]
const [
  { count: studentCount },
  { count: activeSeatsCount },
  { data: pendingFees },
  { data: expiredStudents, count: expiredCount },
  { data: notifications }
] = await Promise.all([
  supabase.from('students').select('*', { count: 'exact', head: true }).eq('library_id', libraryId),
  supabase.from('student_seat_shifts').select('seat_id, seats!inner(library_id)', { count: 'exact', head: true }).eq('seats.library_id', libraryId).gte('end_date', today),
  supabase.from('students').select('total_fee').eq('library_id', libraryId).eq('payment_status', 'pending'),
  supabase.from('students').select('id, name, end_date, seat_id').eq('library_id', libraryId).lt('end_date', today),
  supabase.from('notifications').select('*').eq('library_id', libraryId).eq('is_read', false).order('created_at', { ascending: false }).limit(3)
])
const totalPending = pendingFees?.reduce((acc, curr) => acc + Number(curr.total_fee), 0) || 0

const stats = [
  { label: 'Total Students', value: studentCount || 0, icon: Users, color: 'bg-blue-100 text-blue-600' },
  { label: 'Active Seats', value: activeSeatsCount || 0, icon: Grid, color: 'bg-green-100 text-green-600' },
  { label: 'Pending Fees', value: `₹${totalPending}`, icon: CreditCard, color: 'bg-amber-100 text-amber-600' },
  { label: 'Expired', value: expiredCount || 0, icon: Clock, color: 'bg-red-100 text-red-600' },
]

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* 1. Action Needed Card for Expired Students */}
      {expiredCount && expiredCount > 0 ? (
        <ExpiredStudentsCard 
          count={expiredCount} 
          students={expiredStudents?.map(s => ({
            id: s.id,
            name: s.name,
            daysPast: Math.abs(daysUntil(s.end_date))
          })) || []} 
        />
      ) : null}

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-950 font-mono leading-none">{stat.value}</p>
            <p className="text-[10px] uppercase font-bold text-gray-400 mt-2 tracking-wider">{stat.label}</p>
          </div>
        ) )}
      </div>

      {/* 3. Quick Actions (Placeholder for now) */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-brand-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">New Admission</span>
        </button>
        <button className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Collect Fee</span>
        </button>
      </div>

      {/* 4. Recent Notifications */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Recent Alerts</h3>
          <Bell className="w-4 h-4 text-gray-400" />
        </div>
        <div className="divide-y divide-gray-50">
          {notifications && notifications.length > 0 ? (
            notifications.map(notif => (
              <div key={notif.id} className="p-4 flex gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-950">{notif.title}</p>
                  <p className="text-[10px] text-gray-500 leading-normal">{notif.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs italic">
              No new alerts. You're all caught up!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
