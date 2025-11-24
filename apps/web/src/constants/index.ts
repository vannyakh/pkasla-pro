// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

// Routes
export const ROUTES = {
  HOME: '/',
  JOBS: '/jobs',
  JOB_DETAIL: (id: string) => `/jobs/${id}`,
  JOB_SEARCH: '/jobs/search',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: '/profile',
  PROFILE_JOBS: '/profile/jobs',
  PROFILE_APPLICATIONS: '/profile/applications',
  PROFILE_SETTINGS: '/profile/settings',
  BLOG: '/blog',
  BLOG_POST: (slug: string) => `/blog/${slug}`,
  ADMIN: '/admin',
  ADMIN_JOBS: '/admin/jobs',
  ADMIN_USERS: '/admin/users',
  ADMIN_EMPLOYERS: '/admin/employers',
  ADMIN_APPLICATIONS: '/admin/applications',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_JOB_FEEDS: '/admin/job-feeds',
  ADMIN_BLOG: '/admin/blog',
  ADMIN_SECURITY: '/admin/security',
  ADMIN_PRIVACY: '/admin/privacy',
  EMPLOYER: '/employer',
  EMPLOYER_JOBS: '/employer/jobs',
  EMPLOYER_JOBS_NEW: '/employer/jobs/new',
  EMPLOYER_APPLICATIONS: '/employer/applications',
  EMPLOYER_SETTINGS: '/employer/settings',
} as const;

