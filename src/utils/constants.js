export const ROLES = {
  STUDENT: 'student',
  ALUMNI: 'alumni',
  ADMIN: 'admin',
};

export const BRANCHES = [
  { value: 'CSE', label: 'Computer Science Engineering' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'ECE', label: 'Electronics & Communication' },
  { value: 'EE', label: 'Electrical Engineering' },
  { value: 'ME', label: 'Mechanical Engineering' },
  { value: 'CE', label: 'Civil Engineering' },
  { value: 'BT', label: 'Biotechnology' },
  { value: 'EP', label: 'Engineering Physics' },
  { value: 'COE', label: 'Computer Engineering' },
  { value: 'SE', label: 'Software Engineering' },
  { value: 'MCE', label: 'Mathematics & Computing' },
  { value: 'PIE', label: 'Production & Industrial' },
  { value: 'ENE', label: 'Environmental Engineering' },
  { value: 'Other', label: 'Other' },
];


export const INDUSTRIES = [
  'Technology', 'Finance', 'Consulting', 'Healthcare',
  'Education', 'Manufacturing', 'E-Commerce', 'Media',
  'Automotive', 'Energy', 'Government', 'Research',
  'Telecommunications', 'Real Estate', 'Startups', 'Other',
];

export const POST_CATEGORIES = [
  { value: 'placements', label: 'Placements', icon: '🎯' },
  { value: 'internships', label: 'Internships', icon: '💼' },
  { value: 'higher_studies', label: 'Higher Studies', icon: '🎓' },
  { value: 'startups', label: 'Startups', icon: '🚀' },
  { value: 'general', label: 'General Discussion', icon: '💬' },
];

export const EVENT_TYPES = [
  { value: 'alumni-talk', label: 'Alumni Talk', icon: '🎤' },
  { value: 'webinar', label: 'Webinar', icon: '💻' },
  { value: 'networking', label: 'Networking', icon: '🤝' },
  { value: 'workshop', label: 'Workshop', icon: '🛠️' },
  { value: 'meetup', label: 'Meetup', icon: '☕' },
];

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// ─── TESTING ONLY: set to false before production ───
export const BYPASS_AUTH_FOR_TESTING = false;

export const MOCK_TEST_USER = {
  id: 'test-user-1',
  name: 'Test Student',
  email: 'test@dtu.ac.in',
  role: 'student',
  isProfileComplete: true,
  avatar: null,
};
