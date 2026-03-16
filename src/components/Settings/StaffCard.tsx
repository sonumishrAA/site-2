'use client'

import { Mail, Shield, Clock, Key, Trash2 } from 'lucide-react'

export type StaffMember = {
  id: string
  name: string
  email: string
  role: 'owner' | 'staff'
  staff_type: 'specific' | 'combined'
  last_login: string
  assigned_libraries: { id: string, name: string }[]
}

export default function StaffCard({ 
  staff, 
  allLibraries 
}: { 
  staff: StaffMember, 
  allLibraries: { id: string, name: string }[] 
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xl">
            {staff.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-950 leading-tight">{staff.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded">
                {staff.staff_type === 'combined' ? 'Combined' : 'Specific Library'}
              </span>
              <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest bg-brand-50 px-1.5 py-0.5 rounded">
                {staff.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="truncate">{staff.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>Last seen {staff.last_login}</span>
        </div>
      </div>

      {/* Library Access (GAP 11 FIX) */}
      <div className="space-y-3 pt-4 border-t border-gray-50">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Library Access</p>
        <div className="flex flex-wrap gap-2">
          {allLibraries.map(lib => {
            const isAssigned = staff.assigned_libraries.some(al => al.id === lib.id)
            return (
              <button
                key={lib.id}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isAssigned 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-white border-gray-100 text-gray-400 opacity-60'
                }`}
              >
                {lib.name} {isAssigned ? '✓' : ''}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button className="flex items-center justify-center gap-2 border border-gray-100 bg-gray-50 text-gray-600 p-2.5 rounded-xl font-bold text-[10px] uppercase hover:bg-brand-50 hover:text-brand-500 transition-colors">
          <Key className="w-3.5 h-3.5" />
          Reset Password
        </button>
        <button className="flex items-center justify-center gap-2 border border-red-50 bg-red-50/30 text-red-400 p-2.5 rounded-xl font-bold text-[10px] uppercase hover:bg-red-500 hover:text-white transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      </div>
    </div>
  )
}
