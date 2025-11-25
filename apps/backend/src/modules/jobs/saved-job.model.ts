import { Schema, model, type Document, type Model } from 'mongoose';

export interface SavedJobDocument extends Document {
  userId: string;
  jobId: string;
  createdAt: Date;
  updatedAt: Date;
}

const savedJobSchema = new Schema<SavedJobDocument>(
  {
    userId: { type: String, required: true, index: true },
    jobId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

// Compound index to ensure a user can only save a job once
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

savedJobSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const SavedJobModel: Model<SavedJobDocument> = model<SavedJobDocument>('SavedJob', savedJobSchema);

