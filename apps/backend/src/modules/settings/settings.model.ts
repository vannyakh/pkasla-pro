import { Schema, model, type Document, type Model } from 'mongoose';

export interface SettingsDocument extends Document {
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
  emailPassword?: string;
  notificationOnUserRegistration: boolean;
  notificationOnUserStatusChange: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<SettingsDocument>(
  {
    // General Settings
    siteName: { type: String, default: 'PKASLA', trim: true },
    siteUrl: { type: String, default: 'https://pkasla.com', trim: true },
    siteDescription: { type: String, default: 'Professional Job Portal', trim: true },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistration: { type: Boolean, default: true },
    
    // Security Settings
    sessionTimeout: { type: Number, default: 3600, min: 300, max: 86400 },
    maxLoginAttempts: { type: Number, default: 5, min: 3, max: 10 },
    requireEmailVerification: { type: Boolean, default: false },
    enable2FA: { type: Boolean, default: false },
    passwordMinLength: { type: Number, default: 8, min: 6, max: 32 },
    
    // Storage Settings
    storageProvider: { type: String, enum: ['local', 'r2'], default: 'local' },
    storageLocalPath: { type: String, default: 'uploads', trim: true },
    r2AccountId: { type: String, trim: true },
    r2BucketName: { type: String, trim: true },
    r2PublicUrl: { type: String, trim: true },
    
    // Notification Settings
    emailEnabled: { type: Boolean, default: false },
    emailFrom: { type: String, default: 'noreply@pkasla.com', trim: true },
    emailHost: { type: String, default: 'smtp.example.com', trim: true },
    emailPort: { type: Number, default: 587, min: 1, max: 65535 },
    emailUser: { type: String, trim: true },
    emailPassword: { type: String, select: false, trim: true },
    notificationOnUserRegistration: { type: Boolean, default: true },
    notificationOnUserStatusChange: { type: Boolean, default: true },
  },
  { 
    timestamps: true,
    collection: 'settings',
  }
);

// Note: getOrCreate is handled in the repository layer

settingsSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    delete result.emailPassword; // Never expose password
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const SettingsModel: Model<SettingsDocument> = model<SettingsDocument>('Settings', settingsSchema);

