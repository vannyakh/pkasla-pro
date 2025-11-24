import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface UploadDocument extends Document {
  userId: Types.ObjectId;
  originalFilename: string;
  filename: string;
  url: string;
  key: string;
  provider: 'local' | 'r2';
  mimetype: string;
  size: number;
  folder: string;
  createdAt: Date;
  updatedAt: Date;
}

const uploadSchema = new Schema<UploadDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['local', 'r2'],
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    folder: {
      type: String,
      required: true,
      default: 'general',
      index: true,
    },
  },
  { timestamps: true },
);

uploadSchema.index({ userId: 1, createdAt: -1 });
uploadSchema.index({ folder: 1, createdAt: -1 });

uploadSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const UploadModel: Model<UploadDocument> = model<UploadDocument>('Upload', uploadSchema);

