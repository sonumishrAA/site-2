import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signCrossSiteToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { library_id, purpose } = await request.json()

    if (!purpose || !['renew', 'add-library'].includes(purpose)) {
      return NextResponse.json({ error: 'Invalid purpose' }, { status: 400 })
    }

    if (purpose === 'renew' && !library_id) {
      return NextResponse.json({ error: 'Library ID required for renewal' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify role is owner and owner owns this library (if renew)
    const { data: staffRows } = await supabase
      .from('staff')
      .select('name, phone, role, library_ids')
      .eq('user_id', user.id)

    if (!staffRows || staffRows.length === 0) {
      return NextResponse.json({ error: 'Forbidden: No staff profile found' }, { status: 403 })
    }

    const ownerProfile = staffRows.find(row => row.role === 'owner')

    if (!ownerProfile) {
      return NextResponse.json({ error: 'Forbidden: Only owners can perform this action' }, { status: 403 })
    }

    if (purpose === 'renew' && (!ownerProfile.library_ids || !ownerProfile.library_ids.includes(library_id))) {
      return NextResponse.json({ error: 'Forbidden: You do not own this library' }, { status: 403 })
    }

    // Generate token
    const token = signCrossSiteToken({
      owner_id: user.id,
      owner_email: user.email,
      owner_name: ownerProfile.name,
      owner_phone: ownerProfile.phone,
      library_id: purpose === 'renew' ? library_id : undefined,
      purpose
    })

    return NextResponse.json({ token })
  } catch (error) {
    console.error('generate-token error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
