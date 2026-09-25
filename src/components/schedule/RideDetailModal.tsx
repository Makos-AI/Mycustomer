"use client";

import { MockBooking, MockBookingInstance } from "@/lib/mock-bookings";
import { Calendar, Clock, MapPin, Navigation, X, CreditCard } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface RideDetailModalProps {
  booking: MockBooking;
  instance?: MockBookingInstance;
  onCancel: (instanceId?: string, cancelAll?: boolean) => void;
  onClose: () => void;
  readOnly?: boolean;
}

export function RideDetailModal({ booking, instance, onCancel, onClose, readOnly }: RideDetailModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Time formatting
  const targetDateStr = instance ? instance.scheduledDate : booking.startTime.split('T')[0];
  const dateObj = new Date(targetDateStr);
  const dateFormatted = dateObj.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  
  const startTime = new Date(instance ? instance.startTime : booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(instance ? instance.endTime : booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const fare = booking.counterFare || booking.proposedFare;

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md mx-auto bg-slate-900 border-t border-slate-700 rounded-t-3xl overflow-hidden animate-slide-in shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h2 className="font-semibold text-lg text-white">Ride Details</h2>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Fare Banner */}
          <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${booking.status === 'completed' ? 'bg-slate-700' : 'bg-teal-500/20 text-teal-400'}`}>
                <CarIcon />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">{booking.status === 'completed' ? 'Completed' : 'Scheduled'}</p>
                <Link href={`/profile/${booking.driverContactId}`}>
                  <p className="text-sm font-semibold text-white underline decoration-slate-600 underline-offset-2">View Driver Profile</p>
                </Link>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold">Fare</p>
              <p className="text-lg font-bold text-teal-400">₦{fare.toLocaleString()}</p>
            </div>
          </div>

          {/* Time & Date */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-300">
              <Calendar className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium">{dateFormatted}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Clock className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium">{startTime} – {endTime}</span>
            </div>
          </div>

          {/* Locations */}
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Pickup</p>
                <p className="text-sm text-slate-200">{booking.pickup}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Dropoff</p>
                <p className="text-sm text-slate-200">{booking.dropoff}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        {!readOnly && booking.status !== 'canceled' && booking.status !== 'completed' && (
          <div className="p-4 bg-slate-800/50 border-t border-slate-800">
            {!showCancelConfirm ? (
              <button 
                onClick={handleCancelClick}
                className="w-full bg-red-500/10 border border-red-500/30 text-red-500 font-bold py-4 rounded-xl text-sm transition-colors hover:bg-red-500/20"
              >
                Cancel This Ride
              </button>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <p className="text-center text-sm font-medium text-slate-300">Are you sure you want to cancel?</p>
                {booking.isRecurring ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { onCancel(instance?.id, false); onClose(); }}
                      className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl text-sm"
                    >
                      Cancel this only
                    </button>
                    <button 
                      onClick={() => { onCancel(undefined, true); onClose(); }}
                      className="flex-1 bg-red-900 text-white font-bold py-3 rounded-xl text-sm"
                    >
                      Cancel all future
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl text-sm"
                    >
                      Keep Ride
                    </button>
                    <button 
                      onClick={() => { onCancel(); onClose(); }}
                      className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl text-sm"
                    >
                      Yes, Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <path d="M9 17h6"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  );
}
