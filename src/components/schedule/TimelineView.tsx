"use client";

import { useMemo } from "react";
import { MockBooking, MockBookingInstance } from "@/lib/mock-bookings";

interface TimelineViewProps {
  date: Date;
  bookings: MockBooking[];
  onTapBlock: (booking: MockBooking, instance?: MockBookingInstance) => void;
}

export function TimelineView({ date, bookings, onTapBlock }: TimelineViewProps) {
  // Generate 24 hours (0 to 23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const targetDateStr = date.toISOString().split('T')[0];

  // Map bookings to the target date. 
  const activeBlocks = useMemo(() => {
    const blocks: Array<{ 
      booking: MockBooking; 
      instance?: MockBookingInstance;
      startHour: number; 
      duration: number;
    }> = [];

    bookings.forEach(b => {
      if (b.status === 'canceled' || b.status === 'declined') return;

      if (b.isRecurring) {
        const inst = b.instances.find(i => i.scheduledDate === targetDateStr && i.status !== 'canceled');
        if (inst) {
          const start = new Date(inst.startTime);
          const sHour = start.getHours() + (start.getMinutes() / 60);
          blocks.push({ booking: b, instance: inst, startHour: sHour, duration: b.durationMin / 60 });
        }
      } else {
        const start = new Date(b.startTime);
        if (start.toISOString().split('T')[0] === targetDateStr) {
          const sHour = start.getHours() + (start.getMinutes() / 60);
          blocks.push({ booking: b, startHour: sHour, duration: b.durationMin / 60 });
        }
      }
    });

    return blocks;
  }, [bookings, targetDateStr]);

  return (
    <div className="relative w-full h-[1440px] bg-white pb-24">
      {/* Background grid lines for hours */}
      {hours.map(hour => (
        <div key={hour} className="absolute w-full flex items-start" style={{ top: `${hour * 60}px`, height: '60px' }}>
          <div className="w-16 shrink-0 text-right pr-3 pt-0">
            <span className="text-[11px] text-gray-500 font-medium">
              {hour.toString().padStart(2, '0')}:00
            </span>
          </div>
          <div className="flex-1 border-t border-gray-200 h-full relative group">
            {/* Subtle "Free" background hint */}
            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-gray-50/50">
              <span className="text-xs font-semibold text-gray-400">Tap to schedule</span>
            </div>
          </div>
        </div>
      ))}

      {/* Render Active Booking Blocks */}
      {activeBlocks.map((block, idx) => {
        const top = block.startHour * 60;
        const height = Math.max(45, block.duration * 60); // min height 45px
        const isRepeated = block.booking.isRecurring;
        
        // Calculate end time for display
        const startTimeStr = new Date(isRepeated ? block.instance!.startTime : block.booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const endTime = new Date(new Date(isRepeated ? block.instance!.startTime : block.booking.startTime).getTime() + block.duration * 60 * 60 * 1000);
        const endTimeStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        
        return (
          <div 
            key={`${block.booking.id}-${idx}`}
            onClick={() => onTapBlock(block.booking, block.instance)}
            className="absolute left-[70px] right-2 rounded-r-md px-3 py-1.5 cursor-pointer shadow-sm active:opacity-70 transition-opacity"
            style={{ 
              top: `${top}px`, 
              height: `${height}px`,
              background: '#eef9f9', // Light cyan background like reference
              borderLeft: '4px solid #71d8d8', // Thicker cyan accent border
              zIndex: 10
            }}
          >
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full border-2 border-[#0ea5e9] shrink-0" />
                <span className="text-sm font-bold text-[#1f2937] leading-tight truncate">
                  Ride to {block.booking.dropoff.split(',')[0]}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-[#64748b] text-[11px] font-medium mt-0.5 ml-5">
                <span>🕒 {startTimeStr} - {endTimeStr}</span>
                {isRepeated && <span className="ml-1 text-[#3b82f6]">🔁</span>}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Current time indicator line if viewing today */}
      {new Date().toISOString().split('T')[0] === targetDateStr && (
        <div 
          className="absolute left-16 right-0 border-t border-red-500 z-20 flex items-center"
          style={{ top: `${(new Date().getHours() + new Date().getMinutes() / 60) * 60}px` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute -left-[3px]"></div>
        </div>
      )}
    </div>
  );
}
