import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    // General Settings
    siteName: z.string().min(1).max(100).trim().optional(),
    siteUrl: z.string().url().trim().optional(),
    siteDescription: z.string().max(500).trim().optional(),
    maintenanceMode: z.boolean().optional(),
    allowRegistration: z.boolean().optional(),
    
    // Security Settings
    sessionTimeout: z.number().int().min(300).max(86400).optional(),
    maxLoginAttempts: z.number().int().min(3).max(10).optional(),
    requireEmailVerification: z.boolean().optional(),
    enable2FA: z.boolean().optional(),
    passwordMinLength: z.number().int().min(6).max(32).optional(),
    
    // Storage Settings
    storageProvider: z.enum(['local', 'r2']).optional(),
    storageLocalPath: z.string().min(1).max(200).trim().optional(),
    r2AccountId: z.string().trim().optional(),
    r2BucketName: z.string().trim().optional(),
    r2PublicUrl: z.string().url().trim().optional().or(z.literal('')),
    
    // Notification Settings
    emailEnabled: z.boolean().optional(),
    emailFrom: z.string().email().trim().optional(),
    emailHost: z.string().min(1).max(200).trim().optional(),
    emailPort: z.number().int().min(1).max(65535).optional(),
    emailUser: z.string().trim().optional(),
    emailPassword: z.string().min(1).optional(),
    notificationOnUserRegistration: z.boolean().optional(),
    notificationOnUserStatusChange: z.boolean().optional(),
    
    // Payment Settings
    // Stripe Configuration
    stripeEnabled: z.boolean().optional(),
    stripeSecretKey: z.string().trim().optional(),
    stripePublishableKey: z.string().trim().optional(),
    stripeWebhookSecret: z.string().trim().optional(),
    // Bakong Configuration
    bakongEnabled: z.boolean().optional(),
    bakongAccessToken: z.string().trim().optional(),
    bakongMerchantAccountId: z.string().trim().optional(),
    bakongWebhookSecret: z.string().trim().optional(),
    bakongApiUrl: z.string().url().trim().optional().or(z.literal('')),
    bakongEnvironment: z.enum(['sit', 'production']).optional(),
    
    // Integration Settings
    // Telegram Bot Configuration
    telegramBotEnabled: z.boolean().optional(),
    telegramBotToken: z.string().trim().optional(),
    telegramChatId: z.string().trim().optional(),
    telegramNotifyOnGuestCheckIn: z.boolean().optional(),
    telegramNotifyOnNewGuest: z.boolean().optional(),
    telegramNotifyOnEventCreated: z.boolean().optional(),
  }),
});

export const getSettingsSchema = z.object({
  query: z.object({
    includeSensitive: z.coerce.boolean().optional().default(false),
  }).optional(),
});

export const testTelegramSchema = z.object({
  body: z.object({
    botToken: z.string().min(1, 'Bot Token is required').trim(),
    chatId: z.string().min(1, 'Chat ID is required').trim(),
  }),
});

