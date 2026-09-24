export type RideStatus = 'proposed' | 'countered' | 'accepted' | 'in_progress' | 'completed' | 'canceled';

// Defines allowed transitions
const VALID_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  proposed: ['countered', 'accepted', 'canceled'],
  countered: ['accepted', 'canceled', 'countered'], // Can counter multiple times
  accepted: ['in_progress', 'canceled'],
  in_progress: ['completed', 'canceled'],
  completed: [],
  canceled: []
};

export function canTransition(current: RideStatus, next: RideStatus): boolean {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false;
}

export function getStatusLabel(status: RideStatus): string {
  const labels: Record<RideStatus, string> = {
    proposed: 'Offer Proposed',
    countered: 'Counter Offer',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    canceled: 'Canceled'
  };
  return labels[status];
}
