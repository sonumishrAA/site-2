import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// WhatsApp — always correct (GAP 9 FIX)
export function whatsappLink(phone: string, message?: string): string {
  const base = `https://wa.me/91${phone}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

// Renewal end date — MAX formula (GAP 5 FIX)
export function calcRenewalEndDate(currentEndDate: string, planMonths: number): Date {
  const base = new Date(Math.max(
    new Date(currentEndDate).getTime(),
    new Date().getTime()
  ))
  base.setMonth(base.getMonth() + planMonths)
  return base
}

// Days remaining from today
export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Seat status from DB counts
export type SeatStatus = 'free' | 'occupied' | 'expiring' | 'expired'

export function getSeatStatus(
  activeCount: number, 
  daysLeft: number | null, 
  expiredCount: number
): SeatStatus {
  if (activeCount > 0 && daysLeft !== null && daysLeft <= 7) return 'expiring'
  if (activeCount > 0) return 'occupied'
  if (expiredCount > 0) return 'expired'
  return 'free'
}

// Format phone for display ("8306709245")
export function formatPhone(phone: string): string {
  return `${phone.slice(0,5)} ${phone.slice(5)}`
}

// Robust natural sort for seats (e.g., 1, 2, 10 instead of 1, 10, 2)
export function sortSeats<T extends { seat_number: string }>(seats: T[]): T[] {
  return [...seats].sort((a, b) => 
    a.seat_number.localeCompare(b.seat_number, 'en', { numeric: true, sensitivity: 'base' })
  )
}
