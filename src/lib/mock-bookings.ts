'use client';

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

// ─────────────────────────────────────────────────────────────────────────────
// SEED BOOKINGS — realistic workflow data, week of Sept 22–28 2026
// Today is Friday Sept 25, 2026
// ─────────────────────────────────────────────────────────────────────────────
const getRelativeDateISO = (daysOffset: number, timeStr: string) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const [hours, minutes] = timeStr.split(':');
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date.toISOString();
};

const getRelativeDateStr = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const commuteInstances: MockBookingInstance[] = [
  { id: 'bk-commute-inst-0', bookingId: 'bk-commute', scheduledDate: getRelativeDateStr(-3), startTime: getRelativeDateISO(-3,'07:00'), endTime: getRelativeDateISO(-3,'08:05'), status: 'accepted' },
  { id: 'bk-commute-inst-1', bookingId: 'bk-commute', scheduledDate: getRelativeDateStr(-2), startTime: getRelativeDateISO(-2,'07:00'), endTime: getRelativeDateISO(-2,'08:10'), status: 'accepted' },
  { id: 'bk-commute-inst-2', bookingId: 'bk-commute', scheduledDate: getRelativeDateStr(-1), startTime: getRelativeDateISO(-1,'07:00'), endTime: getRelativeDateISO(-1,'08:20'), status: 'accepted' },
  { id: 'bk-commute-inst-3', bookingId: 'bk-commute', scheduledDate: getRelativeDateStr(0), startTime: getRelativeDateISO(0,'07:00'), endTime: getRelativeDateISO(0,'08:05'), status: 'accepted' },
  { id: 'bk-commute-inst-4', bookingId: 'bk-commute', scheduledDate: getRelativeDateStr(1), startTime: getRelativeDateISO(1,'07:00'), endTime: getRelativeDateISO(1,'08:05'), status: 'accepted' },
  { id: 'bk-commute-inst-5', bookingId: 'bk-commute', scheduledDate: getRelativeDateStr(2), startTime: getRelativeDateISO(2,'07:00'), endTime: getRelativeDateISO(2,'08:05'), status: 'accepted' },
  { id: 'bk-commute-inst-6', bookingId: 'bk-commute', scheduledDate: getRelativeDateStr(3), startTime: getRelativeDateISO(3,'07:00'), endTime: getRelativeDateISO(3,'08:05'), status: 'accepted' },
  { id: 'bk-commute-inst-7', bookingId: 'bk-commute', scheduledDate: getRelativeDateStr(4), startTime: getRelativeDateISO(4,'07:00'), endTime: getRelativeDateISO(4,'08:05'), status: 'accepted' },
];

const INITIAL_BOOKINGS: Record<string, MockBooking> = {

  'bk-commute': {
    id: 'bk-commute',
    driverContactId: 'mock-1',
    riderName: 'Me',
    pickup: 'Lekki Phase 1, Gate B, Lagos',
    dropoff: 'Eko Atlantic, Victoria Island, Lagos',
    distanceKm: 12.5,
    durationMin: 65,
    baselineFare: 2500,
    proposedFare: 2500,
    counterFare: 2800,
    counterNote: 'Fuel prices have increased and 3rd Mainland traffic adds 20+ mins most mornings',
    counterTags: ['Severe Traffic'],
    modifiers: ['AC On'],
    startTime: getRelativeDateISO(-3, '07:00'),
    endTime: getRelativeDateISO(-3, '08:05'),
    status: 'accepted',
    isRecurring: true,
    recurrenceDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    instances: commuteInstances,
    expiresAt: getRelativeDateISO(-2, '07:00'),
  },

  'bk-emeka-past': {
    id: 'bk-emeka-past',
    driverContactId: 'mock-3',
    riderName: 'Me',
    pickup: 'Murtala Muhammed International Airport, Ikeja, Lagos',
    dropoff: 'Lekki Phase 1, Lagos',
    distanceKm: 31.4,
    durationMin: 55,
    baselineFare: 7500,
    proposedFare: 7500,
    counterFare: 8000,
    counterNote: 'Airport queue at night can be over 1 hour',
    counterTags: ['Night Surcharge'],
    modifiers: ['AC On', 'Night Ride'],
    startTime: getRelativeDateISO(-2, '22:45'),
    endTime: getRelativeDateISO(-1, '00:05'),
    status: 'completed',
    isRecurring: false,
    recurrenceDays: [],
    instances: [],
    expiresAt: getRelativeDateISO(-1, '22:45'),
  },

  'bk-sarah-past': {
    id: 'bk-sarah-past',
    driverContactId: 'mock-2',
    riderName: 'Me',
    pickup: 'Ikeja City Mall, Lagos',
    dropoff: 'Yaba, Lagos',
    distanceKm: 14.2,
    durationMin: 45,
    baselineFare: 3200,
    proposedFare: 3500,
    counterFare: null,
    counterNote: null,
    counterTags: [],
    modifiers: ['Quiet Ride'],
    startTime: getRelativeDateISO(-1, '14:30'),
    endTime: getRelativeDateISO(-1, '15:15'),
    status: 'completed',
    isRecurring: false,
    recurrenceDays: [],
    instances: [],
    expiresAt: getRelativeDateISO(0, '14:30'),
  },

  'bk-chinedu-future': {
    id: 'bk-chinedu-future',
    driverContactId: 'mock-1',
    riderName: 'Me',
    pickup: 'Lekki Phase 1, Gate B, Lagos',
    dropoff: 'The Civic Centre, Victoria Island, Lagos',
    distanceKm: 11.8,
    durationMin: 55,
    baselineFare: 2650,
    proposedFare: 2800,
    counterFare: null,
    counterNote: null,
    counterTags: [],
    modifiers: ['AC On'],
    startTime: getRelativeDateISO(1, '09:30'),
    endTime: getRelativeDateISO(1, '10:25'),
    status: 'accepted',
    isRecurring: false,
    recurrenceDays: [],
    instances: [],
    expiresAt: getRelativeDateISO(0, '09:30'),
  },

  'bk-tunde-future': {
    id: 'bk-tunde-future',
    driverContactId: 'mock-4',
    riderName: 'Me',
    pickup: 'Victoria Island, Lagos',
    dropoff: 'Maryland Mall, Ikeja',
    distanceKm: 22.1,
    durationMin: 60,
    baselineFare: 5500,
    proposedFare: 6000,
    counterFare: null,
    counterNote: null,
    counterTags: [],
    modifiers: [],
    startTime: getRelativeDateISO(2, '18:00'),
    endTime: getRelativeDateISO(2, '19:00'),
    status: 'accepted',
    isRecurring: false,
    recurrenceDays: [],
    instances: [],
    expiresAt: getRelativeDateISO(1, '18:00'),
  },

  'bk-emeka-proposed': {
    id: 'bk-emeka-proposed',
    driverContactId: 'mock-3',
    riderName: 'Me',
    pickup: 'Lekki Phase 1, Gate B, Lagos',
    dropoff: 'Balogun Market, Lagos Island',
    distanceKm: 8.2,
    durationMin: 40,
    baselineFare: 1700,
    proposedFare: 1700,
    counterFare: null,
    counterNote: null,
    counterTags: [],
    modifiers: [],
    startTime: getRelativeDateISO(1, '11:00'),
    endTime: getRelativeDateISO(1, '11:40'),
    status: 'proposed',
    isRecurring: false,
    recurrenceDays: [],
    instances: [],
    expiresAt: getRelativeDateISO(1, '11:00'),
  },
};

export function useMockBookings() {
  const [bookings, setBookings] = useState<Record<string, MockBooking>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('mock_bookings');
    const version = localStorage.getItem('mock_bookings_version');
    
    if (stored && version === 'v2') {
      try {
        setBookings(JSON.parse(stored));
      } catch {
        localStorage.removeItem('mock_bookings');
        setBookings(INITIAL_BOOKINGS);
        localStorage.setItem('mock_bookings', JSON.stringify(INITIAL_BOOKINGS));
      }
    } else {
      setBookings(INITIAL_BOOKINGS);
      localStorage.setItem('mock_bookings', JSON.stringify(INITIAL_BOOKINGS));
      localStorage.setItem('mock_bookings_version', 'v2');
    }
    setIsLoaded(true);

    const handleUpdate = () => {
      const fresh = localStorage.getItem('mock_bookings');
      if (fresh) {
        try { setBookings(JSON.parse(fresh)); } catch { /* ignore */ }
      }
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
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
          status: 'accepted' as const
        };
      });
    }

    const newBooking: MockBooking = {
      id,
      driverContactId: draft.driverContactId,
      riderName: 'Me',
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
    if (current) save({ ...bookings, [id]: { ...current, status } });
  };

  const acceptBooking = (id: string) => updateBookingStatus(id, 'accepted');
  const declineBooking = (id: string) => updateBookingStatus(id, 'declined');
  const cancelBooking = (id: string, _reason?: string) => updateBookingStatus(id, 'canceled');

  const counterBooking = (id: string, fare: number, note: string, tags: string[]) => {
    const current = bookings[id];
    if (current) {
      save({
        ...bookings,
        [id]: { ...current, status: 'countered', counterFare: fare, counterNote: note, counterTags: tags }
      });
    }
  };

  const acceptCounter = (id: string) => updateBookingStatus(id, 'accepted');
  const declineCounter = (id: string) => updateBookingStatus(id, 'canceled');

  const cancelInstance = (bookingId: string, instanceId: string, _by: 'rider' | 'driver') => {
    const booking = bookings[bookingId];
    if (booking) {
      const updatedInstances = booking.instances.map(inst =>
        inst.id === instanceId ? { ...inst, status: 'canceled' as const } : inst
      );
      save({ ...bookings, [bookingId]: { ...booking, instances: updatedInstances } });
    }
  };

  return {
    bookings: Object.values(bookings),
    isLoaded,
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
