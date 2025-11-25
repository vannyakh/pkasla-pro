export const USER_ROLES = ['admin', 'user'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['active', 'pending', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const OAUTH_PROVIDERS = ['google', 'github', 'linkedin'] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

