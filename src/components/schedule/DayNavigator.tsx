"use client";

import { useMemo, useEffect, useRef } from "react";
import { ListTodo, Search, Plus, ChevronLeft } from "lucide-react";

interface DayNavigatorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
}

export function DayNavigator({ selectedDate, onChange, minDate, maxDate }: DayNavigatorProps) {
  // Generate a list of dates to show in the strip (e.g. 14 days around the selected date)
  const days = useMemo(() => {
    const arr = [];
    const start = new Date(minDate);
    while (start <= maxDate) {
      arr.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return arr;
  }, [minDate, maxDate]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Center the selected date on load or change
  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

  // e.g. "Friday — 25 Sep 2026"
  const formattedFullDate = selectedDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(',', ' —'); // Format: Friday — 25 Sep 2026

  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="flex flex-col bg-white shrink-0">
      
      {/* Top Calendar Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center text-red-500 font-medium text-xl tracking-tight gap-1">
          <ChevronLeft className="w-6 h-6 -ml-1 stroke-[2.5]" />
          {monthName}
        </div>
        <div className="flex items-center gap-5 text-red-500">
          <ListTodo className="w-6 h-6 stroke-[2]" />
          <Search className="w-6 h-6 stroke-[2]" />
          <Plus className="w-7 h-7 stroke-[2]" />
        </div>
      </div>

      {/* Days Strip */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2 py-3 border-b border-gray-100"
      >
        {days.map((d, i) => {
          const isSelected = d.toDateString() === selectedDate.toDateString();
          const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W...
          const dateNum = d.getDate();
          
          return (
            <button
              key={i}
              data-selected={isSelected}
              onClick={() => onChange(d)}
              className="flex flex-col items-center justify-center min-w-[14%] flex-1 gap-1.5"
            >
              <span className="text-[11px] font-bold text-gray-500 uppercase">{dayName}</span>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[17px] font-semibold transition-colors ${
                isSelected ? 'bg-red-500 text-white shadow-sm' : 'bg-transparent text-black'
              }`}>
                {dateNum}
              </div>
            </button>
          )
        })}
      </div>

      {/* Date Subtitle */}
      <div className="w-full text-center py-2.5 bg-white border-b border-gray-200">
        <span className="text-sm font-bold text-black">{formattedFullDate}</span>
      </div>
      
    </div>
  );
}
