import { AlertCircle, ChevronRight, Trash2, RotateCcw } from 'lucide-react'
import Link from 'next/link'

interface ExpiredStudent {
  id: string
  name: string
  daysPast: number
}

interface ExpiredStudentsCardProps {
  count: number
  students: ExpiredStudent[]
}

export default function ExpiredStudentsCard({ count, students }: ExpiredStudentsCardProps) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-800 uppercase tracking-wider">
            {count} {count === 1 ? 'Student' : 'Students'} need attention
          </h4>
          <p className="text-xs text-red-600 mt-1">
            These students' plans have expired. Renew or remove them to clear their seats.
          </p>
        </div>
      </div>

      <div className="divide-y divide-red-100 bg-white/50">
        {students.slice(0, 3).map((student) => (
          <div key={student.id} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold">
                {student.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">{student.name}</p>
                <p className="text-[10px] text-red-500 font-medium">
                  Expired {student.daysPast} {student.daysPast === 1 ? 'day' : 'days'} ago
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Renew">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link 
        href="/students?filter=expired"
        className="block px-4 py-2 bg-red-100 text-[10px] font-bold text-red-700 uppercase tracking-widest text-center hover:bg-red-200 transition-colors"
      >
        View all expired students <ChevronRight className="w-3 h-3 inline-block" />
      </Link>
    </div>
  )
}
