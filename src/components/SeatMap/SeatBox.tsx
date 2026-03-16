"use client";

import { useState } from "react";
import { cn, SeatStatus } from "@/lib/utils";
import { JetBrains_Mono } from "next/font/google";
import { Settings2, User, Expand } from "lucide-react";

const mono = JetBrains_Mono({ subsets: ["latin"] });

export interface ShiftRow {
  shift: string; // 'M' | 'A' | 'E' | 'N'
  shiftTiming?: string;
  studentName: string | null;
  fatherName?: string | null;
  status: "active" | "expiring" | "occupied" | "expired" | "vacant";
  paymentStatus?: string;
  amountPaid?: number;
  discountAmount?: number;
  totalFee?: number;
}

interface SeatBoxProps {
  seatNumber: string;
  overallStatus: SeatStatus;
  shifts: ShiftRow[];
  hasLocker?: boolean;
  onClick: () => void;
  animationDelay?: number;
}

const PaymentBadge = ({
  s,
  isExpanded,
}: {
  s: ShiftRow;
  isExpanded: boolean;
}) => {
  if (s.status === "vacant") return null;

  if (s.status === "expired") {
    return (
      <span
        className={cn(
          "font-black uppercase border rounded flex items-center justify-center transition-all",
          isExpanded
            ? "text-[10px] px-1.5 py-0.5 text-red-600 bg-red-100/50 border-red-200"
            : "text-[8px] px-1 text-red-500 bg-red-50 border-red-100",
        )}
      >
        Exp
      </span>
    );
  }

  if (s.paymentStatus === "paid")
    return (
      <span
        className={cn(
          "font-black uppercase border rounded flex items-center justify-center transition-all",
          isExpanded
            ? "text-[10px] px-1.5 py-0.5 text-green-600 bg-green-100/50 border-green-200"
            : "text-[8px] px-1 text-green-500 bg-green-50 border-green-100",
        )}
      >
        Paid
      </span>
    );
  if (s.paymentStatus === "pending")
    return (
      <span
        className={cn(
          "font-black uppercase border rounded flex items-center justify-center transition-all",
          isExpanded
            ? "text-[10px] px-1.5 py-0.5 text-amber-600 bg-amber-100/50 border-amber-200"
            : "text-[8px] px-1 text-amber-500 bg-amber-50 border-amber-100",
        )}
      >
        Pend
      </span>
    );

  if (s.paymentStatus === "partial")
    return (
      <div
        className={cn(
          "flex flex-col",
          isExpanded ? "items-start gap-0.5" : "items-center",
        )}
      >
        <span
          className={cn(
            "font-black uppercase border rounded flex items-center justify-center transition-all",
            isExpanded
              ? "text-[10px] px-1.5 py-0.5 text-blue-600 bg-blue-100/50 border-blue-200"
              : "text-[8px] px-1 text-blue-500 bg-blue-50 border-blue-100",
          )}
        >
          Part
        </span>
        {isExpanded && (
          <span className="text-[9px] font-black text-red-500 bg-red-50 px-1 py-0.5 rounded border border-red-100">
            Due: ₹{(s.totalFee || 0) - (s.amountPaid || 0)}
          </span>
        )}
      </div>
    );

  if (s.paymentStatus === "discounted")
    return (
      <span
        className={cn(
          "font-black uppercase border rounded flex items-center justify-center transition-all",
          isExpanded
            ? "text-[10px] px-1.5 py-0.5 text-green-600 bg-green-100/50 border-green-200"
            : "text-[8px] px-1 text-green-500 bg-green-50 border-green-100",
        )}
      >
        Paid*
      </span>
    );

  return null;
};

const boxStyles: Record<SeatStatus, string> = {
  free: "border-gray-200",
  occupied: "border-brand-400",
  expiring: "border-amber-400",
  expired: "border-red-400",
};

export default function SeatBox({
  seatNumber,
  overallStatus,
  shifts,
  hasLocker,
  onClick,
  animationDelay = 0,
}: SeatBoxProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "relative w-full h-[340px] rounded-2xl border-2 flex flex-col overflow-hidden bg-white shadow-sm",
        "transition-all duration-300 ease-out hover:shadow-xl hover:border-brand-300",
        boxStyles[overallStatus],
        overallStatus === "expiring" && "expiring-pulse",
      )}
      style={{
        animation: `seatFadeIn 0.35s ease-out ${animationDelay}ms both`,
      }}
      onMouseLeave={() => setExpandedIndex(null)}
    >
      {/* Header section — Fixed height */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
        <span
          className={cn(
            "text-lg font-black leading-none tracking-tight text-gray-900",
            mono.className,
          )}
        >
          {seatNumber}
        </span>
        <div className="flex gap-2 items-center">
          {hasLocker && (
            <span
              className="w-2 h-2 rounded-full bg-brand-500 animate-pulse border border-brand-200 shadow-sm"
              title="Has locker"
            />
          )}
        </div>
      </div>

      {/* Accordion shifts area — Scrollable container */}
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden p-1 gap-1 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[::-webkit-scrollbar-thumb]:bg-gray-300">
        {shifts.map((s, idx) => {
          const isExpanded = expandedIndex === idx;
          const isCollapsed = expandedIndex !== null && !isExpanded;

          // Define dynamic background based on status
          let shiftBg = "bg-gray-50 hover:bg-gray-100";
          let shiftBorder = "border-gray-100";
          let textColor = "text-gray-400";
          let IconBg = "bg-gray-200 text-gray-500";

          if (s.status !== "vacant") {
            if (s.status === "expired") {
              shiftBg = isExpanded ? "bg-red-50" : "bg-red-50/50";
              shiftBorder = "border-red-200";
              textColor = "text-red-900";
              IconBg = "bg-red-100 text-red-600 border border-red-200";
            } else if (s.status === "expiring") {
              shiftBg = isExpanded ? "bg-amber-50" : "bg-amber-50/50";
              shiftBorder = "border-amber-200";
              textColor = "text-amber-900";
              IconBg = "bg-amber-100 text-amber-600 border border-amber-200";
            } else {
              shiftBg = isExpanded ? "bg-brand-50" : "bg-brand-50/50";
              shiftBorder = "border-brand-200";
              textColor = "text-brand-900";
              IconBg = "bg-brand-100 text-brand-600 border border-brand-200";
            }
          }

          return (
            <div
              key={s.shift}
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              className={cn(
                "rounded-xl border flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer overflow-hidden",
                shiftBg,
                shiftBorder,
                isExpanded
                  ? "flex-[7] shadow-inner p-3 max-h-none"
                  : isCollapsed
                    ? "flex-[1] p-2 opacity-60 hover:opacity-100"
                    : "flex-[2.5] p-2 hover:shadow-md",
              )}
            >
              {/* Top Row: M/A/E/N Icon + Name + Badge */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-black text-xs",
                      mono.className,
                      IconBg,
                    )}
                  >
                    {s.shift}
                  </div>

                  {(!isCollapsed || isExpanded) && (
                    <div className="flex flex-col truncate">
                      <span
                        className={cn(
                          "text-xs font-bold truncate transition-all duration-300",
                          textColor,
                        )}
                      >
                        {s.status === "vacant" ? (
                          <span className="opacity-50 italic">Vacant</span>
                        ) : (
                          s.studentName
                        )}
                      </span>
                      {isExpanded && s.fatherName && (
                        <span
                          className={cn(
                            "text-[9px] font-bold opacity-60 truncate",
                            textColor,
                          )}
                        >
                          S/o {s.fatherName}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Always show small badge when not expanded, rich badge when expanded */}
                <div className="flex shrink-0 ml-2">
                  <PaymentBadge s={s} isExpanded={isExpanded} />
                </div>
              </div>

              {/* Expanded content — Scrollable if needed */}
              <div
                className={cn(
                  "flex flex-col mt-3 opacity-0 transition-opacity duration-300 delay-100 space-y-2.5",
                  isExpanded && "opacity-100 flex-1 justify-end pb-1",
                )}
              >
                {s.status !== "vacant" && s.studentName && (
                  <>
                    <div className="bg-white/60 p-1.5 px-2 rounded-lg border border-white/40 shadow-sm backdrop-blur-sm flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">
                        Timing
                      </span>
                      <span className="text-[9px] font-bold text-gray-800 font-mono">
                        {s.shiftTiming || "—"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs shrink-0">
                      <div className="bg-white/60 p-2 rounded-lg border border-white/40 shadow-sm backdrop-blur-sm">
                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-0.5">
                          End Date
                        </p>
                        <p
                          className={cn(
                            "font-bold truncate",
                            s.status === "expired"
                              ? "text-red-600"
                              : "text-gray-800",
                          )}
                        >
                          {s.status === "expired" && (
                            <span className="mr-1">⚠️</span>
                          )}
                          {s.status === "expiring" && (
                            <span className="mr-1">⏳</span>
                          )}
                          {new Date((s as any).endDate).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short" },
                          )}
                        </p>
                      </div>

                      <div className="bg-white/60 p-2 rounded-lg border border-white/40 shadow-sm backdrop-blur-sm">
                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-0.5">
                          Fee Paid
                        </p>
                        <p className="font-bold text-gray-800 font-mono truncate">
                          ₹
                          {s.paymentStatus === "partial"
                            ? s.amountPaid
                            : s.paymentStatus === "discounted"
                              ? (s.totalFee || 0) - (s.discountAmount || 0)
                              : s.totalFee || 0}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                      }}
                      className="mt-auto w-full py-2 bg-white flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-gray-100 hover:border-brand-300 hover:text-brand-600 transition-colors shrink-0"
                    >
                      <span>Manage Student</span>
                      <Expand className="w-3 h-3" />
                    </button>
                  </>
                )}
                {s.status === "vacant" && (
                  <div className="flex items-center justify-center flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                      }}
                      className="px-4 py-2 bg-white text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-gray-200 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-colors shrink-0"
                    >
                      Assign Student
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
