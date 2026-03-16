import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseService } from '@/lib/supabase/service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      library_id,
      plan_months,
    } = await request.json()

    // 1. HMAC verify
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 })
    }

    // 2. Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // 3. Idempotency — check if already processed
    const { data: existing } = await supabaseService
      .from('subscription_payments')
      .select('id')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // 4. Calculate new subscription dates
    const today = new Date()
    const subscriptionStart = today.toISOString().split('T')[0]

    const subscriptionEnd = new Date(today)
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + Number(plan_months))
    const subscriptionEndStr = subscriptionEnd.toISOString().split('T')[0]

    const deleteDate = new Date(subscriptionEnd)
    deleteDate.setDate(deleteDate.getDate() + 15)
    const deleteDateStr = deleteDate.toISOString().split('T')[0]

    const PLAN_PRICES: Record<number, number> = { 1: 500, 3: 1200, 6: 2200, 12: 4000 }
    const planKey = `${plan_months}m`
    const amount = PLAN_PRICES[Number(plan_months)] || 0

    // 5. Update library subscription
    await supabaseService
      .from('libraries')
      .update({
        subscription_start: subscriptionStart,
        subscription_end: subscriptionEndStr,
        delete_date: deleteDateStr,
        subscription_status: 'active',
        subscription_plan: planKey,
        data_cleared: false,
        notif_sent_7d: false,
        notif_sent_3d: false,
        notif_sent_1d: false,
        cleanup_warn_sent: false,
      })
      .eq('id', library_id)

    // 6. Record payment
    await supabaseService.from('subscription_payments').insert({
      library_id,
      razorpay_order_id,
      razorpay_payment_id,
      amount,
      plan_months: Number(plan_months),
      plan_key: planKey,
      paid_by: user.id,
      processed: true,
    })

    // 7. Insert in-app notification
    await supabaseService.from('notifications').insert({
      library_id,
      type: 'subscription_renewed',
      message: `Subscription renewed for ${plan_months} month${Number(plan_months) > 1 ? 's' : ''}. Active until ${subscriptionEndStr}.`,
      is_read: false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('verify-renewal error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}