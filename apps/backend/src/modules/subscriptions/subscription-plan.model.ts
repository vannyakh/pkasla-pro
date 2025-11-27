import { Schema, model, type Document, type Model } from 'mongoose';

export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlanDocument extends Document {
  name: string;
  displayName: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  maxEvents: number | null; // null = unlimited
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionPlanSchema = new Schema<SubscriptionPlanDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    maxEvents: {
      type: Number,
      default: null, // null means unlimited
      min: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

subscriptionPlanSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const SubscriptionPlanModel: Model<SubscriptionPlanDocument> = model<SubscriptionPlanDocument>(
  'SubscriptionPlan',
  subscriptionPlanSchema,
);

