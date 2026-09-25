"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface DayNavigatorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
}

export function DayNavigator({ selectedDate, onChange, minDate, maxDate }: DayNavigatorProps) {
  
  // Format for display: e.g. "Today", "Tomorrow", "Thu, Oct 24"
  const getDisplayLabel = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    
    return target.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handlePrev = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    if (prev >= minDate) onChange(prev);
  };

  const handleNext = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (next <= maxDate) onChange(next);
  };

  // Check bounds at start of day comparison
  const dStart = new Date(selectedDate).setHours(0,0,0,0);
  const minStart = new Date(minDate).setHours(0,0,0,0);
  const maxStart = new Date(maxDate).setHours(0,0,0,0);
  
  const canPrev = dStart > minStart;
  const canNext = dStart < maxStart;

  return (
    <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-3 shrink-0">
      <button 
        onClick={handlePrev}
        disabled={!canPrev}
        className="p-2 rounded-full hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-teal-400" />
        <span className="font-semibold text-white">
          {getDisplayLabel(selectedDate)}
        </span>
      </div>

      <button 
        onClick={handleNext}
        disabled={!canNext}
        className="p-2 rounded-full hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
