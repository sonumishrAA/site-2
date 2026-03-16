import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)


async function fix() {
  console.log('Fetching students...')
  const { data: students, error: fetchErr } = await supabase
    .from('students')
    .select('*')
    .eq('is_deleted', false)

  if (fetchErr) {
    console.error('Error fetching students:', fetchErr)
    return
  }

  console.log(`Found ${students.length} active students. Rebuilding shifts...`)
  
  // Clean all existing shifts
  await supabase.from('student_seat_shifts').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // Re-insert based on current student state
  const newShifts = []
  for (const s of students) {
    if (s.seat_id && s.selected_shifts && s.selected_shifts.length > 0) {
      for (const shift of s.selected_shifts) {
        newShifts.push({
          student_id: s.id,
          seat_id: s.seat_id,
          shift_code: shift,
          end_date: s.end_date
        })
      }
    }
  }

  if (newShifts.length > 0) {
    console.log(`Inserting ${newShifts.length} shift records...`)
    const { error: insErr } = await supabase.from('student_seat_shifts').insert(newShifts)
    if (insErr) {
      console.error('Error inserting shifts:', insErr)
    } else {
      console.log('Successfully rebuilt student_seat_shifts!')
    }
  } else {
    console.log('No shifts to insert.')
  }
}

fix()
