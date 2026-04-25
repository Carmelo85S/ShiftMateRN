export const DEPARTMENTS = [
  { id: 'kitchen', label: 'Kitchen', icon: 'restaurant-outline' },
  { id: 'bar', label: 'Bar', icon: 'wine-outline' },
  { id: 'service', label: 'Floor/Hall', icon: 'people-outline' },
  { id: 'admin', label: 'Reception/Admin', icon: 'key-outline' }, 
  { id: 'events', label: 'Events', icon: 'star-outline' },         
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export const TITLES_BY_DEPT: Record<string, string[]> = {
  kitchen: ['Chef', 'Sous Chef', 'Commis', 'Dishwasher', 'Pizza Chef', 'Kitchen Porter'],
  bar: ['Bartender', 'Barback', 'Mixologist', 'Bar Assistant'],
  service: ['Waiter/Waitress', 'Runner', 'Hostess', 'Maitre', 'Sommelier'],
  admin: ['Receptionist', 'Night Porter', 'Concierge', 'Office Assistant'],
  events: ['Event Staff', 'Security', 'Promoter'],
  other: ['General Help'],
};