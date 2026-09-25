import { useState, useEffect } from 'react';
import { BookingDraft } from './booking-state';
import { generateRecurringDates } from './fare-calculator';

export type MockBookingInstance = {
  id: string;
  bookingId: string;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // ISO
  endTime: string; // ISO
  status: 'accepted' | 'canceled';
};

export type MockBooking = {
  id: string;
  driverContactId: string;
  riderName: string;
  pickup: string;
  dropoff: string;
  distanceKm: number;
  durationMin: number;
  baselineFare: number;
  proposedFare: number;
  counterFare: number | null;
  counterNote: string | null;
  counterTags: string[];
  modifiers: string[];
  startTime: string; // ISO
  endTime: string; // ISO
  status: 'proposed' | 'countered' | 'accepted' | 'declined' | 'canceled' | 'completed';
  isRecurring: boolean;
  recurrenceDays: string[];
  instances: MockBookingInstance[];
  expiresAt: string; // ISO
};

// Initial mock data if empty
const INITIAL_BOOKINGS: Record<string, MockBooking> = {};

export function useMockBookings() {
  const [bookings, setBookings] = useState<Record<string, MockBooking>>({});

  useEffect(() => {
    const stored = localStorage.getItem('mock_bookings');
    if (stored) {
      setBookings(JSON.parse(stored));
    } else {
      setBookings(INITIAL_BOOKINGS);
      localStorage.setItem('mock_bookings', JSON.stringify(INITIAL_BOOKINGS));
    }

    const handleUpdate = () => {
      const fresh = localStorage.getItem('mock_bookings');
      if (fresh) setBookings(JSON.parse(fresh));
    };
    window.addEventListener('mockBookingsUpdated', handleUpdate);
    return () => window.removeEventListener('mockBookingsUpdated', handleUpdate);
  }, []);

  const save = (newBookings: Record<string, MockBooking>) => {
    setBookings(newBookings);
    localStorage.setItem('mock_bookings', JSON.stringify(newBookings));
    window.dispatchEvent(new Event('mockBookingsUpdated'));
  };

  const createBooking = (draft: BookingDraft) => {
    const id = `booking-${Date.now()}`;
    const start = new Date(draft.startTime);
    const end = new Date(start.getTime() + draft.durationMin * 60000);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    let instances: MockBookingInstance[] = [];
    if (draft.isRecurring && draft.recurrenceDays.length > 0) {
      const dates = generateRecurringDates(start, draft.recurrenceDays);
      instances = dates.map((d, i) => {
        const instStart = new Date(d);
        instStart.setHours(start.getHours(), start.getMinutes(), 0, 0);
        const instEnd = new Date(instStart.getTime() + draft.durationMin * 60000);
        
        return {
          id: `${id}-inst-${i}`,
          bookingId: id,
          scheduledDate: instStart.toISOString().split('T')[0],
          startTime: instStart.toISOString(),
          endTime: instEnd.toISOString(),
          status: 'accepted'
        };
      });
    }

    const newBooking: MockBooking = {
      id,
      driverContactId: draft.driverContactId,
      riderName: 'Me', // Assuming current user is Rider
      pickup: draft.pickupAddress,
      dropoff: draft.dropoffAddress,
      distanceKm: draft.distanceKm,
      durationMin: draft.durationMin,
      baselineFare: draft.baselineFare,
      proposedFare: draft.proposedFare,
      counterFare: null,
      counterNote: null,
      counterTags: [],
      modifiers: draft.modifiers.filter(m => m.active).map(m => m.label),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: 'proposed',
      isRecurring: draft.isRecurring,
      recurrenceDays: draft.recurrenceDays,
      instances,
      expiresAt: expires.toISOString(),
    };

    save({ ...bookings, [id]: newBooking });
    return newBooking;
  };

  const updateBookingStatus = (id: string, status: MockBooking['status']) => {
    const current = bookings[id];
    if (current) {
      save({ ...bookings, [id]: { ...current, status } });
    }
  };

  const acceptBooking = (id: string) => updateBookingStatus(id, 'accepted');
  const declineBooking = (id: string) => updateBookingStatus(id, 'declined');
  const cancelBooking = (id: string, reason: string) => updateBookingStatus(id, 'canceled');

  const counterBooking = (id: string, fare: number, note: string, tags: string[]) => {
    const current = bookings[id];
    if (current) {
      save({
        ...bookings,
        [id]: {
          ...current,
          status: 'countered',
          counterFare: fare,
          counterNote: note,
          counterTags: tags,
        }
      });
    }
  };

  const acceptCounter = (id: string) => updateBookingStatus(id, 'accepted');
  const declineCounter = (id: string) => updateBookingStatus(id, 'canceled');

  const cancelInstance = (bookingId: string, instanceId: string, by: 'rider' | 'driver') => {
    const booking = bookings[bookingId];
    if (booking) {
      const updatedInstances = booking.instances.map(inst => 
        inst.id === instanceId ? { ...inst, status: 'canceled' as const } : inst
      );
      save({
        ...bookings,
        [bookingId]: { ...booking, instances: updatedInstances }
      });
    }
  };

  return {
    bookings: Object.values(bookings),
    createBooking,
    acceptBooking,
    declineBooking,
    counterBooking,
    acceptCounter,
    declineCounter,
    cancelBooking,
    cancelInstance,
  };
}
