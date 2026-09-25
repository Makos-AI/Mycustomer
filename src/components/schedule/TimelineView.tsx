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
  // Need to extract the specific start time for that day if it's recurring.
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
        // Find matching instance for this day
        const inst = b.instances.find(i => i.scheduledDate === targetDateStr && i.status !== 'canceled');
        if (inst) {
          const start = new Date(inst.startTime);
          const sHour = start.getHours() + (start.getMinutes() / 60);
          blocks.push({ booking: b, instance: inst, startHour: sHour, duration: b.durationMin / 60 });
        }
      } else {
        // One-off
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
    <div className="relative w-full h-[1200px] bg-slate-900 pb-24">
      {/* Background grid lines for hours */}
      {hours.map(hour => (
        <div key={hour} className="absolute w-full flex items-start" style={{ top: `${hour * 50}px`, height: '50px' }}>
          <div className="w-16 shrink-0 text-right pr-4 pt-0.5">
            <span className="text-[10px] text-slate-500 font-medium">
              {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </span>
          </div>
          <div className="flex-1 border-t border-slate-800 h-full relative group">
            {/* Subtle "Free" background hint */}
            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center opacity-50 bg-slate-800/30">
              <span className="text-xs font-semibold text-slate-600">Free</span>
            </div>
          </div>
        </div>
      ))}

      {/* Render Active Booking Blocks */}
      {activeBlocks.map((block, idx) => {
        const top = block.startHour * 50;
        const height = Math.max(30, block.duration * 50); // min height 30px
        const isRepeated = block.booking.isRecurring;
        
        return (
          <div 
            key={`${block.booking.id}-${idx}`}
            onClick={() => onTapBlock(block.booking, block.instance)}
            className="absolute left-16 right-4 rounded-xl px-3 py-1 cursor-pointer overflow-hidden shadow-md active:scale-[0.99] transition-transform"
            style={{ 
              top: `${top}px`, 
              height: `${height}px`,
              background: 'linear-gradient(135deg, #0d9488, #0f766e)',
              borderLeft: '4px solid #34d399',
              zIndex: 10
            }}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-white leading-tight">
                Ride w/ {block.booking.driverContactId ? "Contact" : "Unknown"}
              </span>
              <span className="text-[10px] font-semibold text-teal-100 bg-black/20 px-1.5 rounded">
                ₦{(block.booking.counterFare || block.booking.proposedFare).toLocaleString()}
              </span>
            </div>
            
            <p className="text-[10px] text-teal-100 mt-0.5 truncate">
              {block.booking.pickup.split(',')[0]} → {block.booking.dropoff.split(',')[0]}
            </p>
            
            {isRepeated && (
              <span className="inline-block mt-1 bg-black/20 text-teal-100 text-[8px] uppercase px-1.5 py-0.5 rounded-full font-bold">
                Recurring
              </span>
            )}
          </div>
        );
      })}
      
      {/* Current time indicator line if viewing today */}
      {new Date().toISOString().split('T')[0] === targetDateStr && (
        <div 
          className="absolute left-16 right-0 border-t-2 border-red-500 z-20 flex items-center"
          style={{ top: `${(new Date().getHours() + new Date().getMinutes() / 60) * 50}px` }}
        >
          <div className="w-2 h-2 rounded-full bg-red-500 absolute -left-1"></div>
        </div>
      )}
    </div>
  );
}
