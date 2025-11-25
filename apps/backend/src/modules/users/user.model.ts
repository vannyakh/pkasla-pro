import { Schema, model, type Document, type Model, Types } from 'mongoose';
import { USER_ROLES, USER_STATUSES, OAUTH_PROVIDERS, type UserRole, type UserStatus, type CompanyApprovalStatus, type OAuthProvider } from './user.types';

export interface UserProfile {
  title?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
  company?: string;
}

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string; // Optional for OAuth users
  role: UserRole;
  status: UserStatus;
  profile?: UserProfile;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  twoFactorBackupCodes?: string[];
  // OAuth provider fields
  provider?: OAuthProvider;
  providerId?: string;
  // Company registration approval (for recruiters)
  companyApprovalStatus?: CompanyApprovalStatus;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<UserProfile>(
  {
    title: String,
    bio: String,
    location: String,
    website: String,
    avatarUrl: String,
    company: String,
  },
  { _id: false },
);

const userSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, unique: true, sparse: true, index: true, trim: true },
    password: { 
      type: String, 
      required: function(this: UserDocument) {
        return !this.provider; // Password required only if not OAuth user
      }, 
      select: false 
    },
    role: { type: String, enum: USER_ROLES, default: 'candidate' },
    status: { type: String, enum: USER_STATUSES, default: 'active' },
    profile: { type: userProfileSchema, default: {} },
    twoFactorSecret: { type: String, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorBackupCodes: { type: [String], select: false, default: [] },
    // OAuth provider fields
    provider: { type: String, enum: OAUTH_PROVIDERS, index: true },
    providerId: { type: String, index: true },
    // Company registration approval
    companyApprovalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: function(this: UserDocument) {
        return this.role === 'recruiter' ? 'pending' : undefined;
      },
      index: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String, maxlength: 500 },
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

