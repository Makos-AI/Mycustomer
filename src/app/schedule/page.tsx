"use client";

import { useState } from "react";
import { useMockBookings, MockBooking, MockBookingInstance } from "@/lib/mock-bookings";
import { DayNavigator } from "@/components/schedule/DayNavigator";
import { TimelineView } from "@/components/schedule/TimelineView";
import { RideDetailModal } from "@/components/schedule/RideDetailModal";
import { OfferCard } from "@/components/booking/OfferCard";
import { NegotiationPanel } from "@/components/negotiation/NegotiationPanel";

export default function SchedulePage() {
  const { 
    bookings, 
    cancelBooking, 
    cancelInstance,
    acceptBooking,
    declineBooking,
    counterBooking,
    acceptCounter,
    declineCounter
  } = useMockBookings();
  
  const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'pending'>('schedule');
  
  // Tab 1 state
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() - 3);
  
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 3);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [detailBooking, setDetailBooking] = useState<{ booking: MockBooking, instance?: MockBookingInstance } | null>(null);

  // Tab 3 state (negotiation)
  const [negotiationBooking, setNegotiationBooking] = useState<MockBooking | null>(null);

  // Derived datasets
  const completedRides = bookings.filter(b => b.status === 'completed').sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  
  // Pending = proposed (awaiting driver response) or countered (awaiting rider response)
  // For dev bypass context (simulating being the Rider mostly), we show "countered" here to action on them.
  // We'll just show both here for demonstration.
  const pendingRequests = bookings.filter(b => b.status === 'proposed' || b.status === 'countered');
  const pendingCount = pendingRequests.length;

  const handleCancel = (instanceId?: string, cancelAll?: boolean) => {
    if (!detailBooking) return;
    if (detailBooking.booking.isRecurring) {
      if (cancelAll || !instanceId) {
        cancelBooking(detailBooking.booking.id, 'user_canceled_all');
      } else {
        cancelInstance(detailBooking.booking.id, instanceId, 'rider');
      }
    } else {
      cancelBooking(detailBooking.booking.id, 'user_canceled');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden pb-20">
      
      {/* Header & Tabs */}
      <div className="px-4 pt-8 pb-2 shrink-0 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-black mb-4">Calendar</h1>
        
        <div className="flex gap-6">
          {(['schedule', 'history', 'pending'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="pb-2 text-sm font-semibold capitalize transition-colors relative"
              style={{
                color: activeTab === t ? '#ef4444' : '#6b7280',
                borderBottom: activeTab === t ? '2px solid #ef4444' : '2px solid transparent',
                marginBottom: '-1px'
              }}>
              {t}
              {t === 'pending' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-4 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto relative">
        
        {/* TAB 1: SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="animate-fade-in flex flex-col h-full">
            <DayNavigator 
              selectedDate={selectedDate}
              onChange={setSelectedDate}
              minDate={minDate}
              maxDate={maxDate}
            />
            <div className="flex-1 overflow-y-auto">
              <TimelineView 
                date={selectedDate}
                bookings={bookings}
                onTapBlock={(b, i) => setDetailBooking({ booking: b, instance: i })}
              />
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="p-4 space-y-4 animate-fade-in">
            {completedRides.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl opacity-50">🚗</span>
                </div>
                <p className="text-gray-500 font-medium text-sm">No rides yet. Book your first ride!</p>
              </div>
            ) : (
              completedRides.map(ride => (
                <div 
                  key={ride.id} 
                  onClick={() => setDetailBooking({ booking: ride })}
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-900">{new Date(ride.startTime).toLocaleDateString()}</span>
                    <span className="text-sm font-bold text-teal-600">₦{ride.proposedFare.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{ride.pickup} → {ride.dropoff}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: PENDING */}
        {activeTab === 'pending' && (
          <div className="p-4 space-y-4 animate-fade-in flex flex-col items-center">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-20 w-full">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl opacity-50">⏳</span>
                </div>
                <p className="text-gray-500 font-medium text-sm">No pending requests right now.</p>
              </div>
            ) : (
              pendingRequests.map(booking => (
                <OfferCard 
                  key={booking.id}
                  booking={booking}
                  viewerRole="driver" // For demo purposes, pretend we are viewing as the driver to show Accept buttons
                  onAccept={() => {
                    if (booking.status === 'proposed') acceptBooking(booking.id);
                    else if (booking.status === 'countered') acceptCounter(booking.id);
                  }}
                  onDecline={() => {
                    if (booking.status === 'proposed') declineBooking(booking.id);
                    else if (booking.status === 'countered') declineCounter(booking.id);
                  }}
                  onCounter={() => setNegotiationBooking(booking)}
                />
              ))
            )}
          </div>
        )}

      </div>

      {/* Modals */}
      {detailBooking && (
        <RideDetailModal
          booking={detailBooking.booking}
          instance={detailBooking.instance}
          onClose={() => setDetailBooking(null)}
          onCancel={handleCancel}
          readOnly={activeTab === 'history' || new Date(detailBooking.booking.startTime) < new Date()}
        />
      )}

      {negotiationBooking && (
        <NegotiationPanel
          isOpen={!!negotiationBooking}
          proposedFare={negotiationBooking.proposedFare}
          riderName={negotiationBooking.riderName || 'Contact'}
          onClose={() => setNegotiationBooking(null)}
          onCounter={(fare, note, tags) => {
            counterBooking(negotiationBooking.id, fare, note, tags);
          }}
        />
      )}
    </div>
  );
}
