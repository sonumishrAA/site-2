'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FinancialEvent {
  id: string;
  student_id: string;
  student_name: string;
  amount: number;
  payment_mode?: string;
  pending_amount?: number;
  created_at: string;
}

export default function FinancialCalendarClient({ 
  events, 
  currentMonth 
}: { 
  events: FinancialEvent[];
  currentMonth: string; // YYYY-MM-01
}) {
  const router = useRouter();
  
  const mYear = parseInt(currentMonth.split('-')[0]);
  const mMonth = parseInt(currentMonth.split('-')[1]) - 1; // 0-indexed

  const monthName = new Date(mYear, mMonth, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    const prev = new Date(mYear, mMonth - 1, 1);
    router.push(`/financial-calendar?month=${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-01`);
  };

  const handleNextMonth = () => {
    const next = new Date(mYear, mMonth + 1, 1);
    router.push(`/financial-calendar?month=${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`);
  };

  // Group events into collected, refunded, and pending stats for this month
  const collected = events.reduce((acc, e) => (e.amount > 0 ? acc + e.amount : acc), 0);
  const refunded = Math.abs(events.reduce((acc, e) => (e.amount < 0 ? acc + e.amount : acc), 0));
  const netRevenue = collected - refunded;

  return (
    <div className="pb-24 max-w-7xl mx-auto w-full space-y-6">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-14 z-20 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-xl font-serif text-brand-900 leading-none">Financials</h2>
        </div>

        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-200">
          <button 
            onClick={handlePrevMonth}
            className="p-2 text-gray-500 hover:bg-white hover:shadow-sm rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
             <Calendar className="w-4 h-4 text-brand-500" />
             <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">{monthName}</span>
          </div>
          <button 
            onClick={handleNextMonth}
            className="p-2 text-gray-500 hover:bg-white hover:shadow-sm rounded-xl transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Month Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl text-white shadow-lg shadow-green-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
             <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">Fee Collected</p>
             <p className="text-2xl font-black font-mono">₹{collected.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
             <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Refunds</p>
             <p className="text-xl font-black font-mono text-red-500">-₹{refunded.toLocaleString('en-IN')}</p>
          </div>
           <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm col-span-2 md:col-span-1">
             <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Net Revenue</p>
             <p className="text-xl font-black font-mono text-brand-600">₹{netRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
           <div className="px-5 py-4 border-b border-gray-50">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Transactions</h3>
           </div>
           
           <div className="divide-y divide-gray-50">
             {events.length === 0 ? (
               <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <IndianRupee className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No transactions recorded</p>
               </div>
             ) : (
               events.map(event => {
                 const isRefund = event.amount < 0;
                 return (
                   <div key={event.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                     <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                         isRefund ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
                       )}>
                         {isRefund ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                           {event.student_name || 'Unknown Student'}
                         </p>
                         <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-0.5">
                           {new Date(event.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • {event.payment_mode || 'CASH'}
                         </p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className={cn(
                         "text-base font-black font-mono",
                         isRefund ? "text-red-600" : "text-gray-900"
                       )}>
                         {isRefund ? '-' : '+'}₹{Math.abs(event.amount).toLocaleString('en-IN')}
                       </p>
                       {event.pending_amount && event.pending_amount > 0 && !isRefund ? (
                         <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-0.5">Due: ₹{event.pending_amount}</p>
                       ) : null}
                     </div>
                   </div>
                 )
               })
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
