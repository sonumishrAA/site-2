import { NextResponse } from 'next/server'

export async function GET() {
  const headers = [
    'name',
    'father_name',
    'address',
    'phone',
    'gender',
    'morning',
    'afternoon',
    'evening',
    'night',
    'admission_date',
    'plan_months',
    'payment_status',
    'locker'
  ].join(',')

  const sampleRows = [
    'Rahul Kumar,Suresh Kumar,Patna,9876543210,male,Y,Y,N,N,2026-03-15,3,paid,Y',
    'Priya Singh,Anil Singh,Delhi,8765432109,female,N,N,Y,N,2026-03-15,1,pending,N'
  ].join('\n')

  const csv = `${headers}\n${sampleRows}`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=libraryos_students_template.csv',
    },
  })
}
