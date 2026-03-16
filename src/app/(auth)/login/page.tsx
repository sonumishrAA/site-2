'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Mail, Eye, EyeOff, Loader2, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<{ message: string; type: 'auth' | 'network' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    setError(null)
    
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      setError({ message: 'Internet connection is off. Please check your data.', type: 'network' })
      setLoading(false)
      return
    }

    try {
      const { error: authError } = await supabaseBrowser.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        if (authError.message.toLowerCase().includes('fetch') || authError.status === 0) {
          setError({ message: 'Network error. Please check your connection.', type: 'network' })
        } else {
          setError({ message: authError.message, type: 'auth' })
        }
        setLoading(false)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError({ message: 'Unable to connect. Data might be off.', type: 'network' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center space-y-2">
          <img 
            src="/icon.png" 
            alt="LibraryOS Icon" 
            className="w-12 h-12 rounded-xl mx-auto shadow-lg shadow-brand-500/20 mb-4 object-cover"
          />
          <h1 className="text-3xl font-serif text-brand-900">LibraryOS</h1>
          <p className="text-sm text-gray-500 font-medium">Log in to manage your library</p>
        </div>

        {error && (
          <div className={cn(
            "p-4 rounded-xl border animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center text-center gap-2",
            error.type === 'network' ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-red-50 border-red-200 text-red-700"
          )}>
            {error.type === 'network' && (
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-1">
                <WifiOff className="w-5 h-5 text-amber-600" />
              </div>
            )}
            <p className="text-[10px] font-bold uppercase tracking-widest">
              {error.type === 'network' ? 'Connection Error' : 'Login Failed'}
            </p>
            <p className="text-xs font-bold leading-tight">{error.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register('email')}
                type="email"
                className={`block w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-10 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none text-gray-800`}
                placeholder="owner@example.com"
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-[10px] font-bold text-brand-500 hover:underline uppercase tracking-wider"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className={`block w-full rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-10 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none text-gray-800`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : 'Sign In →'}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 font-medium">
            Need an account? <a href="https://libraryos-lms.vercel.app/library-register" className="text-brand-500 font-bold hover:underline">Register your library</a>
          </p>
        </div>
      </div>
    </div>
  )
}
