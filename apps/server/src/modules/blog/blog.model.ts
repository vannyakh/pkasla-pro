import { Schema, model, type Document, type Model, Types } from 'mongoose';

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogDocument extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorId: Types.ObjectId;
  status: BlogStatus;
  tags?: string[];
  publishedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<BlogDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 100,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    featuredImage: {
      type: String,
      trim: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Indexes for common queries
blogSchema.index({ authorId: 1, createdAt: -1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1, status: 1 });
blogSchema.index({ slug: 1 }, { unique: true });

// Text search index
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

blogSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const BlogModel: Model<BlogDocument> = model<BlogDocument>('Blog', blogSchema);

