import { Schema, model, type Document, type Model, Types } from 'mongoose';

export type EventStatus = 'published' | 'draft' | 'completed' | 'cancelled';
export type EventType = 'wedding' | 'engagement' | 'hand-cutting' | 'birthday' | 'anniversary' | 'other';

export interface EventDocument extends Document {
  title: string;
  description?: string;
  eventType: EventType;
  date: Date;
  venue: string;
  googleMapLink?: string;
  hostId: Types.ObjectId; // User who created the event
  coverImage?: string;
  khqrUsd?: string;
  khqrKhr?: string;
  restrictDuplicateNames: boolean;
  status: EventStatus;
  guestCount: number;
  templateSlug?: string; // Selected template slug for this event
  userTemplateConfig?: {
    images?: Record<string, string>; // Custom image URLs
    colors?: Record<string, string>; // Custom colors
    fonts?: Record<string, string>; // Custom fonts
    spacing?: Record<string, number>; // Custom spacing values
    customVariables?: Record<string, string>; // Additional custom variables
  };
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<EventDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['wedding', 'engagement', 'hand-cutting', 'birthday', 'anniversary', 'other'],
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    googleMapLink: {
      type: String,
      trim: true,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coverImage: {
      type: String,
    },
    khqrUsd: {
      type: String,
    },
    khqrKhr: {
      type: String,
    },
    restrictDuplicateNames: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    guestCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    templateSlug: {
      type: String,
      trim: true,
      index: true,
    },
    userTemplateConfig: {
      type: {
        images: Map,
        colors: Map,
        fonts: Map,
        spacing: Map,
        customVariables: Map,
      },
      default: {},
    },
  },
  { timestamps: true },
);

// Compound indexes
eventSchema.index({ hostId: 1, status: 1 });
eventSchema.index({ date: 1, status: 1 });

eventSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const EventModel: Model<EventDocument> = model<EventDocument>('Event', eventSchema);

