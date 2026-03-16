'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitNewAdmission(data: any) {
  const adminClient = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: staffDetails } = await supabase.from('staff').select('role, name').eq('user_id', user?.id).single()

  try {
    // 1. Calculate end date
    const endDate = new Date(data.admission_date)
    endDate.setMonth(endDate.getMonth() + data.plan_months)
    const endDateStr = endDate.toISOString().split('T')[0]
    
    // 1.5 Check if seat-shifts are already taken by someone else
    const { data: existingShifts } = await adminClient
      .from('student_seat_shifts')
      .select('id')
      .eq('seat_id', data.seat_id)
      .in('shift_code', data.selected_shifts)
      .gte('end_date', new Date().toISOString().split('T')[0])

    if (existingShifts && existingShifts.length > 0) {
      throw new Error('This seat or some of its shifts are already occupied.')
    }

    // 2. Insert Student
    const { data: newStudent, error: studentError } = await adminClient
      .from('students')
      .insert({
        library_id: data.library_id,
        name: data.name,
        father_name: data.father_name || null,
        address: data.address || null,
        phone: data.phone || null,
        gender: data.gender,
        admission_date: data.admission_date,
        end_date: endDateStr,
        plan_months: data.plan_months,
        payment_status: data.payment_status,
        total_fee: data.total_fee,
        amount_paid: data.amount_paid || 0,
        discount_amount: data.discount_amount || 0,
        monthly_rate: data.monthly_rate,
        seat_id: data.seat_id,
        locker_id: data.locker_id || null,
        combination_key: data.shift_display,
        shift_display: data.shift_display,
        selected_shifts: data.selected_shifts
      })
      .select()
      .single()

    if (studentError) throw new Error(`Student insert failed: ${studentError.message}`)

    // 3. Insert Shift Records
    const shiftInserts = data.selected_shifts.map((s: string) => ({
      student_id: newStudent.id,
      seat_id: data.seat_id,
      shift_code: s,
      end_date: endDateStr
    }))

    const { error: shiftError } = await adminClient.from('student_seat_shifts').insert(shiftInserts)
    if (shiftError) {
      // Rollback student insert if shifts fail
      await adminClient.from('students').delete().eq('id', newStudent.id)
      throw new Error(`Shift insert failed: ${shiftError.message}`)
    }

    // 4. Update Locker Status if assigned
    if (data.locker_id) {
      await adminClient.from('lockers').update({ status: 'occupied' }).eq('id', data.locker_id)
    }

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateStudent(studentId: string, data: any) {
  const adminClient = createAdminClient()
  
  try {
    // 1.5 Check if seat-shifts are already taken by SOMEONE ELSE
    const { data: existingShifts } = await adminClient
      .from('student_seat_shifts')
      .select('id')
      .eq('seat_id', data.seat_id)
      .in('shift_code', data.shifts)
      .neq('student_id', studentId)
      .gte('end_date', new Date().toISOString().split('T')[0])

    if (existingShifts && existingShifts.length > 0) {
      throw new Error('This seat or some of its shifts are already occupied by another student.')
    }

    // 1. Update Student
    const { error: studentError } = await adminClient
      .from('students')
      .update({
        name: data.name,
        father_name: data.father_name || null,
        address: data.address || null,
        phone: data.phone || null,
        gender: data.gender,
        payment_status: data.payment_status,
        seat_id: data.seat_id,
        locker_id: data.has_locker ? data.locker_id : null,
        shift_display: data.shifts.sort().join('+'),
        selected_shifts: data.shifts
      })
      .eq('id', studentId)

    if (studentError) throw new Error(`Student update failed: ${studentError.message}`)

    // 2. Update Shifts (Delete old, insert new)
    const { error: deleteShiftsError } = await adminClient
      .from('student_seat_shifts')
      .delete()
      .eq('student_id', studentId)

    if (deleteShiftsError) throw new Error(`Old shifts deletion failed: ${deleteShiftsError.message}`)
    
    const shiftInserts = data.shifts.map((s: string) => ({
      student_id: studentId,
      seat_id: data.seat_id,
      shift_code: s,
      end_date: data.end_date
    }))
    
    const { error: insertShiftsError } = await adminClient
      .from('student_seat_shifts')
      .insert(shiftInserts)

    if (insertShiftsError) throw new Error(`New shifts insertion failed: ${insertShiftsError.message}`)

    // 3. Update Locker Status
    if (data.old_locker_id && data.old_locker_id !== data.locker_id) {
      await adminClient.from('lockers').update({ status: 'free' }).eq('id', data.old_locker_id)
    }
    if (data.has_locker && data.locker_id) {
      await adminClient.from('lockers').update({ status: 'occupied' }).eq('id', data.locker_id)
    }

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function renewStudent(data: any) {
  const adminClient = createAdminClient()

  try {
    // 1. Calculate new end date from renewal_date
    const endDate = new Date(data.renewal_date)
    endDate.setMonth(endDate.getMonth() + data.plan_months)
    const endDateStr = endDate.toISOString().split('T')[0]

    // 2. Check if the new seat-shifts are already taken by SOMEONE ELSE
    const { data: existingShifts } = await adminClient
      .from('student_seat_shifts')
      .select('id')
      .eq('seat_id', data.seat_id)
      .in('shift_code', data.selected_shifts)
      .neq('student_id', data.student_id)
      .gte('end_date', new Date().toISOString().split('T')[0])

    if (existingShifts && existingShifts.length > 0) {
      throw new Error('This seat or some of its shifts are already occupied by another student.')
    }

    // 3. Update Student record
    const { error: studentError } = await adminClient
      .from('students')
      .update({
        end_date: endDateStr,
        plan_months: data.plan_months,
        payment_status: data.payment_status,
        total_fee: data.total_fee,
        amount_paid: data.amount_paid || 0,
        discount_amount: data.discount_amount || 0,
        monthly_rate: data.monthly_rate,
        seat_id: data.seat_id,
        locker_id: data.locker_id || null,
        combination_key: data.shift_display,
        shift_display: data.shift_display,
        selected_shifts: data.selected_shifts,
        admission_date: data.renewal_date,
      })
      .eq('id', data.student_id)

    if (studentError) throw new Error(`Student update failed: ${studentError.message}`)

    // 4. Update Shifts (Delete old, insert new)
    await adminClient.from('student_seat_shifts').delete().eq('student_id', data.student_id)

    const shiftInserts = data.selected_shifts.map((s: string) => ({
      student_id: data.student_id,
      seat_id: data.seat_id,
      shift_code: s,
      end_date: endDateStr,
    }))

    const { error: shiftError } = await adminClient.from('student_seat_shifts').insert(shiftInserts)
    if (shiftError) throw new Error(`Shift insert failed: ${shiftError.message}`)

    // 5. Update Locker Status
    if (data.old_locker_id && data.old_locker_id !== data.locker_id) {
      await adminClient.from('lockers').update({ status: 'free' }).eq('id', data.old_locker_id)
    }
    if (data.locker_id) {
      await adminClient.from('lockers').update({ status: 'occupied' }).eq('id', data.locker_id)
    }

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
