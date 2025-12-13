import { Schema, model, type Document, type Model, Types } from 'mongoose';
import { USER_ROLES, USER_STATUSES, OAUTH_PROVIDERS, type UserRole, type UserStatus, type OAuthProvider } from './user.types';


export interface UserDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string; // Optional for OAuth users
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  twoFactorBackupCodes?: string[];
  // OAuth provider fields
  provider?: OAuthProvider;
  providerId?: string;
  // Telegram bot fields
  isTelegramBot: boolean;
  telegramChatId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, unique: true, sparse: true, index: true, trim: true },
    password: { 
      type: String, 
      required: function(this: UserDocument) {
        return !this.provider; // Password required only if not OAuth user
      }, 
      select: false 
    },
    avatar: { type: String },
    role: { type: String, enum: USER_ROLES, default: 'user' },
    status: { type: String, enum: USER_STATUSES, default: 'active' },
    twoFactorSecret: { type: String, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorBackupCodes: { type: [String], select: false, default: [] },
    // OAuth provider fields
    provider: { type: String, enum: OAUTH_PROVIDERS, index: true },
    providerId: { type: String, index: true },
    // Telegram bot fields
    isTelegramBot: { type: Boolean, default: false },
    telegramChatId: { type: String, index: true, sparse: true },
  },
  { timestamps: true },
);

// Compound index for provider + providerId lookup
userSchema.index({ provider: 1, providerId: 1 }, { unique: true, sparse: true });

// Pre-save validation: password is required if no provider
userSchema.pre('save', function(next) {
  if (!this.provider && !this.password) {
    return next(new Error('Password is required for non-OAuth users'));
  }
  next();
});

userSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    delete result.password;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);

