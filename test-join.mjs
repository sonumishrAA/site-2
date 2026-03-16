import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testJoin() {
  console.log('Testing student_seat_shifts join with students...')
  
  const { data, error } = await supabase
    .from('student_seat_shifts')
    .select('seat_id, shift_code, students!inner(is_deleted)')
    .eq('students.is_deleted', false)

  if (error) {
    console.error('Query Error:', error)
  } else {
    console.log('Query Result (count):', data.length)
    console.log('Sample data:', JSON.stringify(data.slice(0, 2), null, 2))
  }
}

testJoin()
