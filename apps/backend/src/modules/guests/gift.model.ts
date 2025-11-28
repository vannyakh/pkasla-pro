import { Schema, model, type Document, type Model, Types } from 'mongoose';

export type PaymentMethod = 'cash' | 'khqr';
export type Currency = 'khr' | 'usd';

export interface GiftDocument extends Document {
  guestId: Types.ObjectId;
  eventId: Types.ObjectId;
  paymentMethod: PaymentMethod;
  currency: Currency;
  amount: number;
  note?: string;
  receiptImage?: string; // URL to receipt image
  createdBy?: Types.ObjectId; // User who recorded this gift
  createdAt: Date;
  updatedAt: Date;
}

const giftSchema = new Schema<GiftDocument>(
  {
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'khqr'],
      required: true,
      index: true,
    },
    currency: {
      type: String,
      enum: ['khr', 'usd'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      trim: true,
    },
    receiptImage: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  { timestamps: true },
);

// Compound indexes
giftSchema.index({ guestId: 1, createdAt: -1 });
giftSchema.index({ eventId: 1, createdAt: -1 });
giftSchema.index({ eventId: 1, paymentMethod: 1 });

giftSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const GiftModel: Model<GiftDocument> = model<GiftDocument>('Gift', giftSchema);

