export const USER_ROLES = ['admin', 'recruiter', 'candidate', 'job_seeker', 'employees'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['active', 'pending', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const COMPANY_APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type CompanyApprovalStatus = (typeof COMPANY_APPROVAL_STATUSES)[number];

export const OAUTH_PROVIDERS = ['google', 'github', 'linkedin'] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

