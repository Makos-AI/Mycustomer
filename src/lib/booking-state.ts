export type BookingState = 'location' | 'route' | 'configure';

export type ActiveModifier = {
  id: string;
  label: string;
  value: number;
  active: boolean;
};

export type BookingDraft = {
  driverContactId: string;
  pickupAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  dropoffAddress: string;
  dropoffLat: number | null;
  dropoffLng: number | null;
  distanceKm: number;
  durationMin: number;
  baselineFare: number;
  proposedFare: number;
  modifiers: ActiveModifier[];
  startTime: string;
  isRecurring: boolean;
  recurrenceDays: string[];
};

export const EMPTY_DRAFT: BookingDraft = {
  driverContactId: '',
  pickupAddress: '',
  pickupLat: null,
  pickupLng: null,
  dropoffAddress: '',
  dropoffLat: null,
  dropoffLng: null,
  distanceKm: 0,
  durationMin: 0,
  baselineFare: 0,
  proposedFare: 0,
  modifiers: [],
  startTime: '',
  isRecurring: false,
  recurrenceDays: [],
};
