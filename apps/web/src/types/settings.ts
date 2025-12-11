// Settings Types
export interface Settings {
  id: string;
  // General Settings
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  
  // Security Settings
  sessionTimeout: number;
  maxLoginAttempts: number;
  requireEmailVerification: boolean;
  enable2FA: boolean;
  passwordMinLength: number;
  
  // Storage Settings
  storageProvider: 'local' | 'r2';
  storageLocalPath: string;
  r2AccountId?: string;
  r2BucketName?: string;
  r2PublicUrl?: string;
  
  // Notification Settings
  emailEnabled: boolean;
  emailFrom: string;
  emailHost: string;
  emailPort: number;
  emailUser?: string;
  notificationOnUserRegistration: boolean;
  notificationOnUserStatusChange: boolean;
  
  // Payment Settings
  // Stripe Configuration
  stripeEnabled: boolean;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  stripeWebhookSecret?: string;
  // Bakong Configuration
  bakongEnabled: boolean;
  bakongAccessToken?: string;
  bakongMerchantAccountId?: string;
  bakongWebhookSecret?: string;
  bakongApiUrl?: string;
  bakongEnvironment?: 'sit' | 'production';
  
  // Integration Settings
  // Telegram Bot Configuration
  telegramBotEnabled: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramNotifyOnGuestCheckIn: boolean;
  telegramNotifyOnNewGuest: boolean;
  telegramNotifyOnEventCreated: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsDto {
  // General Settings
  siteName?: string;
  siteUrl?: string;
  siteDescription?: string;
  maintenanceMode?: boolean;
  allowRegistration?: boolean;
  
  // Security Settings
  sessionTimeout?: number;
  maxLoginAttempts?: number;
  requireEmailVerification?: boolean;
  enable2FA?: boolean;
  passwordMinLength?: number;
  
  // Storage Settings
  storageProvider?: 'local' | 'r2';
  storageLocalPath?: string;
  r2AccountId?: string;
  r2BucketName?: string;
  r2PublicUrl?: string;
  
  // Notification Settings
  emailEnabled?: boolean;
  emailFrom?: string;
  emailHost?: string;
  emailPort?: number;
  emailUser?: string;
  emailPassword?: string;
  notificationOnUserRegistration?: boolean;
  notificationOnUserStatusChange?: boolean;
  
  // Payment Settings
  // Stripe Configuration
  stripeEnabled?: boolean;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  stripeWebhookSecret?: string;
  // Bakong Configuration
  bakongEnabled?: boolean;
  bakongAccessToken?: string;
  bakongMerchantAccountId?: string;
  bakongWebhookSecret?: string;
  bakongApiUrl?: string;
  bakongEnvironment?: 'sit' | 'production';
  
  // Integration Settings
  // Telegram Bot Configuration
  telegramBotEnabled?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramNotifyOnGuestCheckIn?: boolean;
  telegramNotifyOnNewGuest?: boolean;
  telegramNotifyOnEventCreated?: boolean;
}

export interface SystemInfo {
  nodeEnv: string;
  version: string;
  uptime: number;
  maintenanceMode: boolean;
}
