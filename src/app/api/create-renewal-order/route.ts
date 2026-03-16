import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
})

const PLAN_PRICES: Record<number, number> = {
  1: 500,
  3: 1200,
  6: 2200,
  12: 4000,
}

export async function POST(request: NextRequest) {
  try {
    const { library_id, plan_months } = await request.json()

    if (!library_id || !plan_months) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify this owner owns this library
    const { data: staff } = await supabase
      .from('staff')
      .select('library_ids, role')
      .eq('user_id', user.id)
      .single()

    if (staff?.role !== 'owner' || !staff.library_ids?.includes(library_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const amount = PLAN_PRICES[plan_months]
    if (!amount) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `renewal_${library_id}_${Date.now()}`,
      notes: {
        library_id,
        plan_months: String(plan_months),
        type: 'subscription_renewal',
      },
    })

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('create-renewal-order error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}