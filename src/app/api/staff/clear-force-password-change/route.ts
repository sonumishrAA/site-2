import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { error } = await admin
      .from('staff')
      .update({ force_password_change: false })
      .eq('user_id', user.id)

    if (error) {
      console.error('clear-force-password-change error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update staff profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('clear-force-password-change unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

