'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: updateError } = await supabaseBrowser.auth.updateUser({
      password: password,
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      // Also update staff table to set force_password_change = false
      const { data: { user } } = await supabaseBrowser.auth.getUser()
      if (user) {
        await supabaseBrowser
          .from('staff')
          .update({ force_password_change: false })
          .eq('user_id', user.id)
      }
      
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-brand-900">Change Password</h1>
          <p className="mt-2 text-sm text-gray-600">You are required to change your password on first login.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-500 text-red-700 text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 text-white py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
