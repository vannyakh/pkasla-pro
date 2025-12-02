import { Schema, model, type Document, type Model, Types } from 'mongoose';

export type PaymentLogEventType = 
  | 'payment_created'
  | 'payment_intent_created'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'payment_expired'
  | 'payment_cancelled'
  | 'webhook_received'
  | 'webhook_processed'
  | 'webhook_failed'
  | 'transaction_status_checked';

export type PaymentMethod = 'stripe' | 'bakong';
export type PaymentType = 'subscription' | 'template';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'expired' | 'cancelled';

export interface PaymentLogDocument extends Document {
  userId?: Types.ObjectId;
  transactionId?: string;
  paymentMethod?: PaymentMethod;
  paymentType?: PaymentType;
  eventType: PaymentLogEventType;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  planId?: Types.ObjectId;
  templateId?: Types.ObjectId;
  metadata?: Record<string, any>;
  error?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentLogSchema = new Schema<PaymentLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    transactionId: {
      type: String,
      trim: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'bakong'],
      index: true,
    },
    paymentType: {
      type: String,
      enum: ['subscription', 'template'],
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'payment_created',
        'payment_intent_created',
        'payment_succeeded',
        'payment_failed',
        'payment_expired',
        'payment_cancelled',
        'webhook_received',
        'webhook_processed',
        'webhook_failed',
        'transaction_status_checked',
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'expired', 'cancelled'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      trim: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// Compound indexes for common queries
paymentLogSchema.index({ userId: 1, createdAt: -1 });
paymentLogSchema.index({ transactionId: 1, createdAt: -1 });
paymentLogSchema.index({ paymentMethod: 1, status: 1, createdAt: -1 });
paymentLogSchema.index({ eventType: 1, createdAt: -1 });
paymentLogSchema.index({ createdAt: -1 });

paymentLogSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    
    // Handle userId - preserve populated data
    if (result.userId && typeof result.userId === 'object' && result.userId._id) {
      result.userId_populated = {
        id: result.userId._id.toString(),
        name: result.userId.name,
        email: result.userId.email,
      };
      result.userId = result.userId._id.toString();
    } else if (result.userId) {
      result.userId = result.userId.toString();
    }
    
    // Handle planId - preserve populated data
    if (result.planId && typeof result.planId === 'object' && result.planId._id) {
      result.planId_populated = {
        id: result.planId._id.toString(),
        displayName: result.planId.displayName,
        price: result.planId.price,
      };
      result.planId = result.planId._id.toString();
    } else if (result.planId) {
      result.planId = result.planId.toString();
    }
    
    // Handle templateId - preserve populated data
    if (result.templateId && typeof result.templateId === 'object' && result.templateId._id) {
      result.templateId_populated = {
        id: result.templateId._id.toString(),
        title: result.templateId.title,
        price: result.templateId.price,
      };
      result.templateId = result.templateId._id.toString();
    } else if (result.templateId) {
      result.templateId = result.templateId.toString();
    }
    
    return result;
  },
});

export const PaymentLogModel: Model<PaymentLogDocument> = model<PaymentLogDocument>(
  'PaymentLog',
  paymentLogSchema,
);

