// Default market rates (Lagos)
const BASE_CHARGE = 100; // NGN
const PER_KM_RATE = 50;  // NGN
const PER_MIN_RATE = 10; // NGN

export function calculateBaselineFare(distanceKm: number, durationMinutes: number): number {
  if (!distanceKm && !durationMinutes) return 0;
  
  const fare = BASE_CHARGE + (distanceKm * PER_KM_RATE) + (durationMinutes * PER_MIN_RATE);
  // Round UP to nearest 50
  return Math.ceil(fare / 50) * 50;
}

export type Modifier = {
  id: string;
  label: string;
  increment: number;
};

export const modifiers: Modifier[] = [
  { id: 'ac_on', label: 'AC On', increment: 200 },
  { id: 'extra_luggage', label: 'Extra Luggage', increment: 500 },
  { id: 'night_ride', label: 'Night Ride', increment: 300 },
  { id: 'pet', label: 'Pet Friendly', increment: 300 },
  { id: 'express', label: 'Express Route', increment: 400 },
];

export function generateRecurringDates(
  startDate: Date, 
  days: string[],
  weeksAhead = 12
): Date[] {
  const dates: Date[] = [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const dayMap: Record<string, number> = {
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
  };

  const targetDays = days.map(d => dayMap[d]).filter(d => d !== undefined);

  if (targetDays.length === 0) return dates;

  const end = new Date(start);
  end.setDate(end.getDate() + weeksAhead * 7);

  let current = new Date(start);
  // Generate future dates matching the selected days
  while (current <= end) {
    if (targetDays.includes(current.getDay())) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
