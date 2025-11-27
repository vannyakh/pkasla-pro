import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface TemplatePurchaseDocument extends Document {
  userId: Types.ObjectId;
  templateId: Types.ObjectId;
  price: number;
  purchaseDate: Date;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const templatePurchaseSchema = new Schema<TemplatePurchaseDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
      index: true,
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
  },
  { timestamps: true },
);

// Compound index to prevent duplicate purchases (user + template)
templatePurchaseSchema.index({ userId: 1, templateId: 1 }, { unique: true });

templatePurchaseSchema.set('toJSON', {
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
    if (result.templateId && result.templateId._id) {
      result.templateId = result.templateId._id.toString();
    } else if (result.templateId) {
      result.templateId = result.templateId.toString();
    }
    return result;
  },
});

export const TemplatePurchaseModel: Model<TemplatePurchaseDocument> = model<TemplatePurchaseDocument>(
  'TemplatePurchase',
  templatePurchaseSchema,
);

