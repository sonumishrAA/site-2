'use client'

import { useState } from 'react'
import { Building2, Clock, CreditCard, User, ShieldCheck, Grid, Lock, Users, Plus, Edit2, ChevronDown, MapPin, Map, Users2, Info, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SettingsClientProps {
  user: any
  profile: any
  library: any
  shifts: any[]
  comboPlans: any[]
  lockerPolicy: any
  stats: {
    seats: number
    lockers: number
    students: number
    unreadNotifs: number
  }
  staffMembers: any[]
  allOwnedLibraries: any[]
}

export default function SettingsClient({
  user,
  profile,
  library,
  shifts,
  comboPlans,
  lockerPolicy,
  stats,
  staffMembers,
  allOwnedLibraries
}: SettingsClientProps) {
  const router = useRouter()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  async function handleAddLibrary() {
    if (profile?.role !== 'owner') {
      alert('Only the owner can add a new library branch.')
      return
    }

    setLoadingAction('add-library')
    try {
      const res = await fetch('/api/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'add-library' })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      window.location.href = `https://libraryos.in/add-library?token=${data.token}`
    } catch (err: any) {
      alert(err.message)
      setLoadingAction(null)
    }
  }

  const settingsCards = [
    { 
      id: 'lib', 
      label: 'Library Information', 
      icon: Building2, 
      color: 'text-blue-500 bg-blue-50', 
      value: library?.name,
      content: (
        <div className="pt-4 space-y-4 text-left border-t border-gray-50 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Library Name</p>
              <p className="text-sm font-bold text-gray-800">{library?.name}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Seat Type</p>
              <p className="text-sm font-bold text-brand-600 uppercase">{library?.seat_type}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Location</p>
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-gray-600 leading-relaxed">
                {library?.address}, {library?.city}, {library?.state} - {library?.pincode}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="text-center space-y-0.5">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Total Seats</p>
              <p className="text-xs font-black text-gray-900 font-mono">{stats.seats}</p>
            </div>
            <div className="text-center space-y-0.5 border-x border-gray-200">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Students</p>
              <p className="text-xs font-black text-brand-600 font-mono">{stats.students}</p>
            </div>
            <div className="text-center space-y-0.5">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Lockers</p>
              <p className="text-xs font-black text-gray-900 font-mono">{stats.lockers}</p>
            </div>
          </div>
        </div>
      )
    },
    { 
      id: 'timing', 
      label: 'Shift & Timing', 
      icon: Clock, 
      color: 'text-amber-500 bg-amber-50', 
      value: `${shifts?.length || 0} Shifts`,
      content: (
        <div className="pt-4 space-y-4 text-left border-t border-gray-50 mt-2">
          <div className="space-y-3">
            {shifts?.map(shift => (
              <div key={shift.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-black text-xs font-mono">
                    {shift.name.slice(0, 1)}
                  </div>
                  <p className="text-xs font-bold text-gray-800">{shift.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-900 font-mono">{shift.start_time} - {shift.end_time}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-gray-400 italic text-center">Timings are configured for each base shift.</p>
        </div>
      )
    },
    { 
      id: 'pricing', 
      label: 'Plans & Pricing', 
      icon: CreditCard, 
      color: 'text-green-500 bg-green-50', 
      value: `${comboPlans?.length || 0} active plans`,
      content: (
        <div className="pt-4 space-y-4 text-left border-t border-gray-50 mt-2">
          <div className="overflow-x-auto -mx-5 px-5 scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Shift</th>
                  {[1, 3, 6, 12].map(m => (
                    <th key={m} className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center border-b border-gray-100">{m}M</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set(comboPlans?.map(p => p.combination_key))).sort((a,b) => a.length - b.length).map(combo => (
                  <tr key={combo} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 text-[10px] font-black text-brand-700 font-mono">{combo}</td>
                    {[1, 3, 6, 12].map(m => {
                      const plan = comboPlans.find(p => p.combination_key === combo && p.months === m)
                      return (
                        <td key={m} className="py-3 px-3 text-center border-l border-gray-50/50">
                          {plan ? (
                            <span className="text-[10px] font-bold text-gray-900 font-mono">₹{plan.fee}</span>
                          ) : (
                            <span className="text-[10px] text-gray-200">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 bg-brand-50 p-3 rounded-xl border border-brand-100">
            <Info className="w-3.5 h-3.5 text-brand-500" />
            <p className="text-[9px] text-brand-600 font-medium leading-tight">
              Prices shown are per student. Locker fees are extra as per policy.
            </p>
          </div>
        </div>
      )
    },
    { 
      id: 'profile', 
      label: 'My Profile', 
      icon: User, 
      color: 'text-purple-500 bg-purple-50', 
      value: profile?.name || user?.email?.split('@')[0],
      content: (
        <div className="pt-4 space-y-4 text-left border-t border-gray-50 mt-2 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-50 border-2 border-purple-100 flex items-center justify-center mx-auto mb-2">
            <User className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">{profile?.name}</p>
            <p className="text-[10px] font-bold text-gray-400 lowercase">{user?.email}</p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <span className="bg-brand-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
              {profile?.role || 'owner'}
            </span>
            <span className="bg-green-100 text-green-700 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
              Active Session
            </span>
          </div>
        </div>
      )
    },
  ]

  return (
    <div className="p-4 pb-24 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-900/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif text-brand-900 leading-none">Settings</h2>
        </div>
        <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <Info className="w-3.5 h-3.5" /> {stats.unreadNotifs} Unread
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-2 gap-4">
        {settingsCards.map((card) => (
          <button 
            key={card.id} 
            onClick={() => toggleSection(card.id)}
            className={cn(
              "bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center gap-3 active:scale-[0.98] transition-all group overflow-hidden h-fit",
              expandedSection === card.id ? "col-span-2 border-brand-200 ring-4 ring-brand-50" : "col-span-1"
            )}
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 duration-300", card.color)}>
              <card.icon className="w-6 h-6" />
            </div>
            <div className={cn(expandedSection === card.id ? "text-center w-full" : "")}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{card.label}</p>
              {!expandedSection && <p className="text-xs font-bold text-gray-800 mt-1 truncate max-w-[100px]">{card.value}</p>}
            </div>
            
            {expandedSection === card.id && (
              <div className="w-full animate-in slide-in-from-top-4 duration-300">
                {card.content}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Infrastructure Section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Infrastructure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                <Grid className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Seat Inventory</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{stats.seats} Total Seats Configured</p>
              </div>
            </div>
            {profile?.role === 'owner' && (
              <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Locker & Policy</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">₹{lockerPolicy?.monthly_fee || 0}/mo • {lockerPolicy?.eligible_combos?.length || 0} combos</p>
              </div>
            </div>
            {profile?.role === 'owner' && (
              <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Staff Accounts Section */}
      {profile?.role === 'owner' && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Staff Accounts</h3>
            {/* Note: In DB logic, the owner can add unlimited staff; UI indicates count */}
            <span className="text-[10px] font-black text-brand-500">{staffMembers.length} ACTIVE</span>
          </div>

          <div className="space-y-3">
            {staffMembers.map((staff) => (
              <div key={staff.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">
                        {staff.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{staff.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className="bg-brand-50 text-brand-700 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                            {staff.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                      <User className="w-3.5 h-3.5" /> {staff.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" /> Active in assigned branches
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Branch Access</p>
                    <div className="flex flex-wrap gap-2">
                      {allOwnedLibraries.filter(lib => staff.library_ids?.includes(lib.id)).map(lib => (
                        <div key={lib.id} className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                          {lib.name} <span className="text-green-500">✓</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {profile?.role === 'owner' && (
                  <div className="grid grid-cols-2 border-t border-gray-50">
                    <button className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-50 flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5" /> Reset Password
                    </button>
                    <button className="p-4 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                      <Users className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Another Library Section */}
      {profile?.role === 'owner' && (
        <div className="space-y-4 pt-2">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Expansion</h3>
          <button 
            onClick={handleAddLibrary}
            disabled={loadingAction === 'add-library'}
            className="w-full bg-brand-50 border border-brand-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 group active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-500 shadow-xl shadow-brand-500/10 group-hover:scale-110 transition-transform duration-500">
              {loadingAction === 'add-library' ? (
                <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              ) : (
                <Plus className="w-8 h-8" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-brand-900">
                {loadingAction === 'add-library' ? 'Preparing...' : 'Add Another Library'}
              </p>
              <p className="text-[10px] text-brand-600 font-medium uppercase tracking-wider mt-1">Run multiple branches from one account</p>
            </div>
          </button>
        </div>
      )}

      {/* Logout */}
      <div className="pt-4">
        <button
          onClick={async () => {
            setLoggingOut(true)
            await supabaseBrowser.auth.signOut()
            router.push('/login')
          }}
          disabled={loggingOut}
          className="w-full bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest active:scale-[0.98] transition-all hover:bg-red-100 disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  )
}
