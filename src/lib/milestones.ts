export interface Milestone {
  id: string;
  type: 'trip' | 'distance';
  threshold: number;
  title: string;
  message: string;
  icon: string;
}

export const MILESTONES: Milestone[] = [
  { id: 'trip_1', type: 'trip', threshold: 1, title: 'First Trip Together!', message: 'You just completed your first trip together. Here’s to many more!', icon: '🎉' },
  { id: 'trip_5', type: 'trip', threshold: 5, title: '5 Trips Strong!', message: 'Five trips together. You guys are building a great connection!', icon: '🤝' },
  { id: 'trip_25', type: 'trip', threshold: 25, title: '25 Trips!', message: 'That is 25 successful trips! True reliability.', icon: '🏆' },
  { id: 'distance_100', type: 'distance', threshold: 100, title: '100km Traveled!', message: 'You have traveled over 100 kilometers together on MyCustomer.', icon: '🗺️' },
  { id: 'distance_500', type: 'distance', threshold: 500, title: '500km Traveled!', message: 'Half a thousand kilometers together. Amazing!', icon: '⭐' }
];

export function checkNewMilestones(currentTrips: number, currentDistance: number, lastCelebratedTrip: number, lastCelebratedDistance: number): Milestone[] {
  const newMilestones: Milestone[] = [];
  
  MILESTONES.forEach(m => {
    if (m.type === 'trip' && currentTrips >= m.threshold && lastCelebratedTrip < m.threshold) {
      newMilestones.push(m);
    }
    if (m.type === 'distance' && currentDistance >= m.threshold && lastCelebratedDistance < m.threshold) {
      newMilestones.push(m);
    }
  });

  return newMilestones;
}
