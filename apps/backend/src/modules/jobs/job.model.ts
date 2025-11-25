import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface JobDocument extends Document {
  title: string;
  company: string;
  description: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  location: string;
  isRemote: boolean;
  tags: string[];
  salaryRange?: SalaryRange;
  status: 'draft' | 'published' | 'archived';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  postedBy?: string; // User ID who posted the job
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryRangeSchema = new Schema(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  { _id: false },
);

const jobSchema = new Schema<JobDocument>(
  {
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    description: { type: String, required: true },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'internship'],
      default: 'full_time',
    },
    location: { type: String, required: true, index: true },
    isRemote: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    salaryRange: { type: SalaryRangeSchema, required: false },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String, maxlength: 500 },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ approvalStatus: 1, createdAt: -1 });
jobSchema.index({ postedBy: 1, approvalStatus: 1 });

jobSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const JobModel: Model<JobDocument> = model<JobDocument>('Job', jobSchema);

