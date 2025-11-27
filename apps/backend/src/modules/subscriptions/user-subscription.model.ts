import { Schema, model, type Document, type Model, Types } from 'mongoose';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export interface UserSubscriptionDocument extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod?: string;
  transactionId?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSubscriptionSchema = new Schema<UserSubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'pending'],
      default: 'pending',
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
      index: true,
    },
    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Compound index for active subscriptions lookup
userSubscriptionSchema.index({ userId: 1, status: 1 });

userSubscriptionSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    if (result.userId && result.userId._id) {
      result.userId = result.userId._id.toString();
    } else if (result.userId) {
      result.userId = result.userId.toString();
    }
    if (result.planId && result.planId._id) {
      result.planId = result.planId._id.toString();
    } else if (result.planId) {
      result.planId = result.planId.toString();
    }
    return result;
  },
});

export const UserSubscriptionModel: Model<UserSubscriptionDocument> = model<UserSubscriptionDocument>(
  'UserSubscription',
  userSubscriptionSchema,
);

