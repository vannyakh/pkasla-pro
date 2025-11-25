import { Schema, model, type Document, type Model, Types } from 'mongoose';

export type FeedbackType = 'feedback' | 'complaint';
export type FeedbackStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface FeedbackDocument extends Document {
  type: FeedbackType;
  subject: string;
  message: string;
  userId: Types.ObjectId;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  adminResponse?: string;
  respondedBy?: Types.ObjectId;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<FeedbackDocument>(
  {
    type: {
      type: String,
      enum: ['feedback', 'complaint'],
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Indexes for common queries
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, priority: -1, createdAt: -1 });
feedbackSchema.index({ type: 1, status: 1 });

feedbackSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const FeedbackModel: Model<FeedbackDocument> = model<FeedbackDocument>('Feedback', feedbackSchema);

