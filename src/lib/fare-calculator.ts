// Default market rates (Lagos)
const BASE_CHARGE = 100; // NGN
const PER_KM_RATE = 50;  // NGN
const PER_MIN_RATE = 10; // NGN

export function calculateBaselineFare(distanceKm: number, durationMinutes: number): number {
  if (!distanceKm && !durationMinutes) return 0;
  
  const fare = BASE_CHARGE + (distanceKm * PER_KM_RATE) + (durationMinutes * PER_MIN_RATE);
  // Round to nearest 50
  return Math.round(fare / 50) * 50;
}

export const modifiers = [
  { id: 'ac_on', label: 'AC On', increment: 200 },
  { id: 'extra_luggage', label: 'Extra Luggage', increment: 500 },
  { id: 'pet', label: 'Pet Friendly', increment: 300 }
];
