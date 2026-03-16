import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function deepClean() {
  console.log('--- DEEP CLEAN START ---')
  
  // 1. Fetch all student_seat_shifts
  const { data: shifts, error: shiftErr } = await supabase
    .from('student_seat_shifts')
    .select('id, seat_id, shift_code, student_id')

  if (shiftErr) {
    console.error('Error fetching shifts:', shiftErr)
    return
  }

  const seen = new Set()
  const duplicates = []

  for (const s of shifts) {
    const key = `${s.seat_id}-${s.shift_code}`
    if (seen.has(key)) {
      duplicates.push(s)
    } else {
      seen.add(key)
    }
  }

  if (duplicates.length === 0) {
    console.log('No overlapping shifts found.')
  } else {
    console.log(`Found ${duplicates.length} overlapping shift records. Cleaning...`)
    
    for (const dup of duplicates) {
      console.log(`Removing shift record ${dup.id} for student ${dup.student_id} from seat ${dup.seat_id}`)
      
      // Delete the shift record
      await supabase.from('student_seat_shifts').delete().eq('id', dup.id)
      
      // Set student's seat_id to NULL so they don't show up on that seat in the UI
      await supabase.from('students').update({ seat_id: null }).eq('id', dup.student_id)
    }
    console.log('Cleanup complete.')
  }
}

deepClean()
