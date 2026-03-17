'use client'

import { useState, useMemo } from 'react'
import { Building2, Clock, CreditCard, User, ShieldCheck, Grid, Lock, Users, Plus, Edit2, ChevronDown, MapPin, Map, Users2, Info, LogOut, X, Save, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { callEdgeFunction } from '@/lib/api'

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
  library: initialLibrary,
  shifts: initialShifts,
  comboPlans: initialComboPlans,
  lockerPolicy: initialLockerPolicy,
  stats,
  staffMembers,
  allOwnedLibraries
}: SettingsClientProps) {
  const router = useRouter()
  const [library, setLibrary] = useState(initialLibrary)
  const [shifts, setShifts] = useState(initialShifts)
  const [comboPlans, setComboPlans] = useState(initialComboPlans)
  const [lockerPolicy, setLockerPolicy] = useState(initialLockerPolicy)
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  
  // Edit Modals State
  const [editModal, setEditModal] = useState<'inventory' | 'lockers' | 'shifts' | 'pricing' | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form States
  const [inventoryForm, setInventoryForm] = useState({
    male_seats: library?.male_seats || 0,
    female_seats: library?.female_seats || 0,
    neutral_seats: library?.neutral_seats || 0
  })
  const [lockersForm, setLockersForm] = useState({
    male_lockers: library?.male_lockers || 0,
    female_lockers: library?.female_lockers || 0,
    neutral_lockers: library?.neutral_lockers || 0,
    monthly_fee: lockerPolicy?.monthly_fee || 0,
    eligible_combos: lockerPolicy?.eligible_combos || [] as string[]
  })
  const [shiftsForm, setShiftsForm] = useState(shifts.map(s => ({ ...s })))
  const [pricingForm, setPricingForm] = useState(comboPlans.map(p => ({ ...p })))

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  async function handleUpdateInventory() {
    setIsSaving(true)
    const { error } = await supabaseBrowser
      .from('libraries')
      .update({
        male_seats: inventoryForm.male_seats,
        female_seats: inventoryForm.female_seats,
        neutral_seats: inventoryForm.neutral_seats
      })
      .eq('id', library.id)

    if (error) alert(error.message)
    else {
      setLibrary({ ...library, ...inventoryForm })
      setEditModal(null)
      router.refresh()
    }
    setIsSaving(false)
  }

  async function handleUpdateLockers() {
    setIsSaving(true)
    const { error: libError } = await supabaseBrowser
      .from('libraries')
      .update({
        male_lockers: lockersForm.male_lockers,
        female_lockers: lockersForm.female_lockers,
        neutral_lockers: lockersForm.neutral_lockers
      })
      .eq('id', library.id)

    const { error: policyError } = await supabaseBrowser
      .from('locker_policies')
      .update({ 
        monthly_fee: lockersForm.monthly_fee,
        eligible_combos: lockersForm.eligible_combos
      })
      .eq('library_id', library.id)

    if (libError || policyError) alert(libError?.message || policyError?.message)
    else {
      setLibrary({ ...library, ...lockersForm })
      setLockerPolicy({ ...lockerPolicy, monthly_fee: lockersForm.monthly_fee, eligible_combos: lockersForm.eligible_combos })
      setEditModal(null)
      router.refresh()
    }
    setIsSaving(false)
  }

  async function handleUpdateShifts() {
    setIsSaving(true)
    let hasError = false
    for (const s of shiftsForm) {
      const { error } = await supabaseBrowser
        .from('shifts')
        .update({ start_time: s.start_time, end_time: s.end_time })
        .eq('id', s.id)
      if (error) {
        alert(error.message)
        hasError = true
        break
      }
    }
    if (!hasError) {
      setShifts(shiftsForm)
      setEditModal(null)
      router.refresh()
    }
    setIsSaving(false)
  }

  async function handleUpdatePricing() {
    setIsSaving(true)
    let hasError = false
    for (const p of pricingForm) {
      const { error } = await supabaseBrowser
        .from('combo_plans')
        .update({ fee: p.fee })
        .eq('id', p.id)
      if (error) {
        alert(error.message)
        hasError = true
        break
      }
    }
    if (!hasError) {
      setComboPlans(pricingForm)
      setEditModal(null)
      router.refresh()
    }
    setIsSaving(false)
  }

  async function handleAddLibrary() {
    if (profile?.role !== 'owner') {
      alert('Only the owner can add a new library branch.')
      return
    }

    setLoadingAction('add-library')
    try {
      const data = await callEdgeFunction('generate-token', {
        body: { purpose: 'add-library' },
        libraryId: library.id
      })
      
      window.location.href = `https://libraryos.in/add-library?token=${data.token}`
    } catch (err: any) {
      alert(err.message)
      setLoadingAction(null)
    }
  }

  const allComboKeys = useMemo(() => {
    return Array.from(new Set(comboPlans.map(p => p.combination_key))).sort((a,b) => a.length - b.length)
  }, [comboPlans])

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
              <p className="text-sm font-bold text-brand-600 uppercase">{library?.is_gender_neutral ? 'Neutral' : 'Gendered'}</p>
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
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] text-gray-400 italic">Timings for each base shift.</p>
            {profile?.role === 'owner' && (
              <button 
                onClick={(e) => { e.stopPropagation(); setEditModal('shifts') }}
                className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
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
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] text-gray-400 italic">Prices shown are per student.</p>
            {profile?.role === 'owner' && (
              <button 
                onClick={(e) => { e.stopPropagation(); setEditModal('pricing') }}
                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
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
                {allComboKeys.map(combo => (
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
              <button 
                onClick={() => setEditModal('inventory')}
                className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-all"
              >
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
              <button 
                onClick={() => setEditModal('lockers')}
                className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-all"
              >
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
                  <div className="border-t border-gray-50">
                    <button className="w-full p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5" /> Reset Password
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

      {/* MODALS */}
      {editModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-serif text-xl text-brand-900">
                {editModal === 'inventory' ? 'Edit Seat Inventory' :
                 editModal === 'lockers' ? 'Edit Locker Policy' :
                 editModal === 'shifts' ? 'Edit Shift Timings' :
                 'Edit Plans & Pricing'}
              </h3>
              <button onClick={() => setEditModal(null)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              {editModal === 'inventory' && (
                <div className="space-y-4">
                  {library?.is_gender_neutral ? (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Neutral Seats</label>
                      <input 
                        type="number" 
                        value={inventoryForm.neutral_seats}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, neutral_seats: parseInt(e.target.value) || 0 })}
                        className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Male Seats</label>
                          <input 
                            type="number" 
                            value={inventoryForm.male_seats}
                            onChange={(e) => setInventoryForm({ ...inventoryForm, male_seats: parseInt(e.target.value) || 0 })}
                            className="w-full mt-1 bg-blue-50 border border-blue-100 rounded-2xl p-4 font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Female Seats</label>
                          <input 
                            type="number" 
                            value={inventoryForm.female_seats}
                            onChange={(e) => setInventoryForm({ ...inventoryForm, female_seats: parseInt(e.target.value) || 0 })}
                            className="w-full mt-1 bg-pink-50 border border-pink-100 rounded-2xl p-4 font-bold text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <p className="text-[10px] text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    NOTE: This only changes the capacity counts. Individual seat numbers are generated based on these totals.
                  </p>
                </div>
              )}

              {editModal === 'lockers' && (
                <div className="space-y-6">
                  {/* Locker Inventory - Only show Neutral if Neutral Library, else M/F/N */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Locker Inventory</label>
                    <div className="grid grid-cols-3 gap-3">
                      {!library?.is_gender_neutral ? (
                        <>
                          <div>
                            <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Male</label>
                            <input type="number" value={lockersForm.male_lockers} onChange={(e) => setLockersForm({ ...lockersForm, male_lockers: parseInt(e.target.value) || 0 })} className="w-full mt-1 bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm font-bold" />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Female</label>
                            <input type="number" value={lockersForm.female_lockers} onChange={(e) => setLockersForm({ ...lockersForm, female_lockers: parseInt(e.target.value) || 0 })} className="w-full mt-1 bg-pink-50 border border-pink-100 rounded-xl p-3 text-sm font-bold" />
                          </div>
                        </>
                      ) : null}
                      <div className={cn(library?.is_gender_neutral ? "col-span-3" : "col-span-1")}>
                        <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Neutral</label>
                        <input type="number" value={lockersForm.neutral_lockers} onChange={(e) => setLockersForm({ ...lockersForm, neutral_lockers: parseInt(e.target.value) || 0 })} className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Monthly Locker Fee (₹)</label>
                    <input type="number" value={lockersForm.monthly_fee} onChange={(e) => setLockersForm({ ...lockersForm, monthly_fee: parseFloat(e.target.value) || 0 })} className="w-full mt-1 bg-amber-50 border border-amber-100 rounded-2xl p-4 font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                  </div>

                  {/* Eligible Combos Multi-select */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Locker Eligible Shifts</label>
                    <div className="flex flex-wrap gap-2">
                      {allComboKeys.map(combo => {
                        const isSelected = lockersForm.eligible_combos.includes(combo)
                        return (
                          <button
                            key={combo}
                            onClick={() => {
                              const next = isSelected 
                                ? lockersForm.eligible_combos.filter((c: string) => c !== combo)
                                : [...lockersForm.eligible_combos, combo]
                              setLockersForm({ ...lockersForm, eligible_combos: next })
                            }}
                            className={cn(
                              "px-3 py-2 rounded-xl border text-[10px] font-black font-mono transition-all",
                              isSelected ? "bg-brand-900 text-white border-brand-900 shadow-md" : "bg-white text-gray-400 border-gray-100 hover:border-brand-200"
                            )}
                          >
                            {combo} {isSelected && <CheckCircle2 className="w-2.5 h-2.5 inline-block ml-1" />}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[9px] text-gray-400 italic">Students with these shift combinations can opt for a locker.</p>
                  </div>
                </div>
              )}

              {editModal === 'shifts' && (
                <div className="space-y-4">
                  {shiftsForm.map((s, idx) => (
                    <div key={s.id} className="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 grid grid-cols-2 gap-4">
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-brand-900 text-white flex items-center justify-center text-[10px] font-bold">{s.code}</div>
                        <p className="text-xs font-bold text-gray-900">{s.name}</p>
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Start Time</label>
                        <input type="time" value={s.start_time} onChange={(e) => {
                          const newShifts = [...shiftsForm]
                          newShifts[idx].start_time = e.target.value
                          setShiftsForm(newShifts)
                        }} className="w-full mt-1 bg-white border rounded-xl p-2 text-xs font-bold" />
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">End Time</label>
                        <input type="time" value={s.end_time} onChange={(e) => {
                          const newShifts = [...shiftsForm]
                          newShifts[idx].end_time = e.target.value
                          setShiftsForm(newShifts)
                        }} className="w-full mt-1 bg-white border rounded-xl p-2 text-xs font-bold" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {editModal === 'pricing' && (
                <div className="space-y-3">
                  {pricingForm.sort((a,b) => a.combination_key.length - b.combination_key.length || a.months - b.months).map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-brand-700 font-mono w-8">{p.combination_key}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{p.months}M</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">₹</span>
                        <input 
                          type="number" 
                          value={p.fee}
                          onChange={(e) => {
                            const newPricing = [...pricingForm]
                            newPricing[idx].fee = parseFloat(e.target.value) || 0
                            setPricingForm(newPricing)
                          }}
                          className="w-20 bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setEditModal(null)}
                className="flex-1 p-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                disabled={isSaving}
                onClick={() => {
                  if (editModal === 'inventory') handleUpdateInventory()
                  else if (editModal === 'lockers') handleUpdateLockers()
                  else if (editModal === 'shifts') handleUpdateShifts()
                  else if (editModal === 'pricing') handleUpdatePricing()
                }}
                className="flex-1 p-4 bg-brand-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
