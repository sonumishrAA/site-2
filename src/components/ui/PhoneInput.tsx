'use client'

import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value: string
  onChange: (val: string) => void
  error?: string
  label?: string
  optional?: boolean
}

export default function PhoneInput({ value, onChange, error, label = "Phone", optional = false }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and max 10
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    onChange(val)
  }

  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
        {label} {optional && <span className="lowercase font-medium">(optional)</span>}
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
          <span className="text-sm font-bold text-gray-400">+91</span>
          <div className="w-[1px] h-3.5 bg-gray-200" />
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          className={cn(
            "block w-full rounded-xl border bg-gray-50 pl-14 pr-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none text-gray-800 font-mono tracking-wider",
            error ? "border-red-500" : "border-gray-200"
          )}
          placeholder="00000 00000"
        />
      </div>
      {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
    </div>
  )
}
