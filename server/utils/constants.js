export const ROLES = {
  STUDENT: 'student',
  ALUMNI: 'alumni',
  ADMIN: 'admin',
};

export const BRANCHES = [
  'CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'BT', 'EP',
  'COE', 'SE', 'MCE', 'PIE', 'ENE', 'Other',
];

export const INDUSTRIES = [
  'Technology', 'Finance', 'Consulting', 'Healthcare',
  'Education', 'Manufacturing', 'E-Commerce', 'Media',
  'Automotive', 'Energy', 'Government', 'Research',
  'Telecommunications', 'Real Estate', 'Startups', 'Other',
];

export const JOB_TYPES = ['internship', 'full-time', 'part-time', 'contract'];
export const WORK_MODES = ['remote', 'onsite', 'hybrid'];

export const POST_CATEGORIES = [
  'placements', 'internships', 'higher-studies', 'startups', 'general',
];

export const EVENT_TYPES = [
  'alumni-talk', 'webinar', 'networking', 'workshop', 'meetup',
];

export const NOTIFICATION_TYPES = [
  'mentorship_request', 'mentorship_accepted', 'mentorship_rejected',
  'message', 'job_posted', 'application_update',
  'event_reminder', 'community_reply', 'community_upvote',
  'achievement_unlocked', 'system', 'verification',
];

export const STUDENT_BADGES = [
  { badge: 'community_contributor', title: 'Community Contributor', description: 'Created 10+ posts', points: 50 },
  { badge: 'active_learner', title: 'Active Learner', description: 'Attended 5+ events', points: 30 },
  { badge: 'networking_champion', title: 'Networking Champion', description: 'Connected with 20+ alumni', points: 75 },
  { badge: 'first_mentorship', title: 'First Steps', description: 'Completed first mentorship', points: 25 },
  { badge: 'job_seeker', title: 'Job Seeker', description: 'Applied to 10+ jobs', points: 40 },
  { badge: 'discussion_starter', title: 'Discussion Starter', description: 'Started 5+ discussions', points: 20 },
  { badge: 'helpful_peer', title: 'Helpful Peer', description: 'Got 50+ upvotes on comments', points: 60 },
  { badge: 'event_attendee', title: 'Event Regular', description: 'Attended 10+ events', points: 45 },
];

export const ALUMNI_BADGES = [
  { badge: 'top_mentor', title: 'Top Mentor', description: 'Mentored 10+ students', points: 100 },
  { badge: 'community_builder', title: 'Community Builder', description: '100+ forum contributions', points: 80 },
  { badge: 'hiring_champion', title: 'Hiring Champion', description: 'Posted 5+ jobs', points: 60 },
  { badge: 'knowledge_sharer', title: 'Knowledge Sharer', description: 'Organized 3+ events', points: 50 },
  { badge: 'event_organizer', title: 'Event Organizer', description: 'Created 5+ events', points: 55 },
  { badge: 'industry_leader', title: 'Industry Leader', description: 'Top-rated mentor', points: 120 },
];
