import { Schema, model, type Document, type Model, Types } from 'mongoose';

export type AuditLogAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'view'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'unpublish'
  | 'payment'
  | 'subscription'
  | 'other';

export type AuditLogStatus = 'success' | 'failure' | 'pending';

export interface AuditLogDocument extends Document {
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: AuditLogAction;
  resource: string; // e.g., 'user', 'event', 'template', 'payment'
  resourceId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  status: AuditLogStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    userId: { type: String, index: true },
    userEmail: { type: String, index: true },
    userName: { type: String },
    action: { 
      type: String, 
      enum: [
        'create',
        'update',
        'delete',
        'login',
        'logout',
        'view',
        'export',
        'import',
        'approve',
        'reject',
        'publish',
        'unpublish',
        'payment',
        'subscription',
        'other',
      ],
      required: true,
      index: true,
    },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    description: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { 
      type: String, 
      enum: ['success', 'failure', 'pending'],
      default: 'success',
      index: true,
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

auditLogSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const AuditLogModel: Model<AuditLogDocument> = model<AuditLogDocument>('AuditLog', auditLogSchema);

