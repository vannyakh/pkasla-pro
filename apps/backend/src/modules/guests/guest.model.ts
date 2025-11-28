import { Schema, model, type Document, type Model, Types } from 'mongoose';

export type GuestStatus = 'pending' | 'confirmed' | 'declined';

export interface GuestDocument extends Document {
  name: string;
  email?: string;
  phone?: string;
  eventId: Types.ObjectId;
  userId?: Types.ObjectId; // If guest is a registered user
  createdBy?: Types.ObjectId; // User who added/created this guest
  status: GuestStatus;
  occupation?: string;
  notes?: string;
  tag?: string; // e.g., 'bride', 'groom'
  address?: string;
  province?: string;
  photo?: string; // URL to guest photo
  hasGivenGift?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const guestSchema = new Schema<GuestDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'declined'],
      default: 'pending',
      index: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    tag: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    province: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    hasGivenGift: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Compound indexes
guestSchema.index({ eventId: 1, status: 1 });
guestSchema.index({ eventId: 1, email: 1 });
guestSchema.index({ eventId: 1, phone: 1 });
guestSchema.index({ createdBy: 1, eventId: 1 });
// guestSchema.index({ userId: 1, eventId: 1 }, { unique: true, sparse: true });

guestSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const GuestModel: Model<GuestDocument> = model<GuestDocument>('Guest', guestSchema);

