import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim() !== '')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const rows = lines.slice(1)

    const { data: staff } = await supabase.from('staff').select('library_ids').eq('user_id', user.id).single()
    const libraryId = staff?.library_ids?.[0]
    if (!libraryId) return NextResponse.json({ success: false, message: 'No library assigned' }, { status: 403 })

    const [
      { data: seats },
      { data: lockers },
      { data: combos },
      { data: policy }
    ] = await Promise.all([
      supabase.from('seats').select('id, seat_number, gender').eq('library_id', libraryId).eq('is_active', true),
      supabase.from('lockers').select('id, locker_number, gender, status').eq('library_id', libraryId),
      supabase.from('combo_plans').select('*').eq('library_id', libraryId),
      supabase.from('locker_policies').select('monthly_fee').eq('library_id', libraryId).single()
    ])

    const { data: occupiedShifts } = await supabase
      .from('student_seat_shifts')
      .select('seat_id, shift_code')
      .gte('end_date', new Date().toISOString().split('T')[0])

    let importedCount = 0
    let skippedCount = 0
    const errors: string[] = []

    for (const row of rows) {
      const values = row.split(',').map(v => v.trim())
      if (values.length < headers.length) continue
      
      const studentData: any = {}
      headers.forEach((h, i) => { studentData[h] = values[i] })

      try {
        if (!studentData.name || !studentData.phone || !studentData.gender) {
          skippedCount++
          continue
        }

        const selectedShifts: string[] = []
        if (studentData.morning?.toUpperCase() === 'Y') selectedShifts.push('M')
        if (studentData.afternoon?.toUpperCase() === 'Y') selectedShifts.push('A')
        if (studentData.evening?.toUpperCase() === 'Y') selectedShifts.push('E')
        if (studentData.night?.toUpperCase() === 'Y') selectedShifts.push('N')

        if (selectedShifts.length === 0) {
          errors.push(`${studentData.name}: No shifts selected`)
          skippedCount++
          continue
        }

        const comboKey = [...selectedShifts].sort().join('')
        const planMonths = parseInt(studentData.plan_months || '1')

        const availableSeat = seats?.find(s => {
          const isTaken = occupiedShifts?.some(os => 
            os.seat_id === s.id && selectedShifts.includes(os.shift_code)
          )
          return !isTaken && (s.gender === 'neutral' || s.gender === studentData.gender.toLowerCase())
        })

        if (!availableSeat) {
          errors.push(`${studentData.name}: No seat available for ${comboKey}`)
          skippedCount++
          continue
        }

        let assignedLockerId = null
        if (studentData.locker?.toUpperCase() === 'Y') {
          const freeLocker = lockers?.find(l => 
            l.status === 'free' && 
            (l.gender === 'neutral' || l.gender === studentData.gender.toLowerCase())
          )
          if (freeLocker) {
            assignedLockerId = freeLocker.id
            freeLocker.status = 'occupied'
          }
        }

        const plan = combos?.find(c => c.combination_key === comboKey && c.months === planMonths)
        const baseFee = plan?.fee || 0
        const lockerFee = assignedLockerId ? (policy?.monthly_fee || 150) : 0
        const totalFee = baseFee + (lockerFee * planMonths)

        const endDate = new Date(studentData.admission_date)
        endDate.setMonth(endDate.getMonth() + planMonths)
        const endDateStr = endDate.toISOString().split('T')[0]

        const { data: newStudent, error: insertError } = await supabase
          .from('students')
          .insert({
            library_id: libraryId,
            name: studentData.name,
            father_name: studentData.father_name || null,
            address: studentData.address || null,
            phone: studentData.phone,
            gender: studentData.gender.toLowerCase(),
            admission_date: studentData.admission_date,
            end_date: endDateStr,
            plan_months: planMonths,
            payment_status: (studentData.payment_status?.toLowerCase() || 'pending'),
            total_fee: totalFee,
            monthly_rate: totalFee / planMonths,
            seat_id: availableSeat.id,
            locker_id: assignedLockerId,
            combination_key: comboKey,
            shift_display: comboKey,
            selected_shifts: selectedShifts
            })

          .select()
          .single()

        if (insertError) throw insertError

        const shiftInserts = selectedShifts.map(s => ({
          student_id: newStudent.id,
          seat_id: availableSeat.id,
          shift_code: s,
          end_date: endDateStr
        }))

        await supabase.from('student_seat_shifts').insert(shiftInserts)

        if (assignedLockerId) {
          await supabase.from('lockers').update({ status: 'occupied' }).eq('id', assignedLockerId)
        }

        importedCount++
      } catch (err: any) {
        errors.push(`${studentData.name || 'Row'}: ${err.message}`)
        skippedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import process finished.`,
      details: {
        total_rows: rows.length,
        imported: importedCount,
        skipped: skippedCount,
        errors: errors.slice(0, 10)
      }
    })

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
