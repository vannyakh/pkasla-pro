import { Schema, model, type Document, type Model, Types } from 'mongoose';

export type ApplicationStatus = 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn';

export interface ApplicationDocument extends Document {
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  notes?: string; // Internal notes by recruiter/admin
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<ApplicationDocument>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted', 'withdrawn'],
      default: 'pending',
      index: true,
    },
    coverLetter: {
      type: String,
      maxlength: 5000,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    linkedInUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Indexes for common queries
applicationSchema.index({ jobId: 1, createdAt: -1 });
applicationSchema.index({ candidateId: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true }); // Prevent duplicate applications

applicationSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const ApplicationModel: Model<ApplicationDocument> = model<ApplicationDocument>('Application', applicationSchema);

