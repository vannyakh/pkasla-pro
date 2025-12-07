import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface AgendaItemDocument extends Document {
  eventId: Types.ObjectId;
  date: string; // ISO date string, e.g. "2025-12-31"
  time: string; // Time in HH:mm format, e.g. "07:00"
  description?: string;
  createdBy?: Types.ObjectId; // User who created this agenda item
  createdAt: Date;
  updatedAt: Date;
}

const agendaItemSchema = new Schema<AgendaItemDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
      index: true,
      // Validate date format: YYYY-MM-DD
      validate: {
        validator: function(v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: 'Date must be in YYYY-MM-DD format',
      },
    },
    time: {
      type: String,
      required: true,
      trim: true,
      // Validate time format: HH:mm
      validate: {
        validator: function(v: string) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: 'Time must be in HH:mm format (24-hour)',
      },
    },
    description: {
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
agendaItemSchema.index({ eventId: 1, date: 1 });
agendaItemSchema.index({ eventId: 1, date: 1, time: 1 });

agendaItemSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const AgendaItemModel: Model<AgendaItemDocument> = model<AgendaItemDocument>('AgendaItem', agendaItemSchema);

