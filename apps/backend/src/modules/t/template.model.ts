import { Schema, model, type Document, type Model } from 'mongoose';

export interface TemplateDocument extends Document {
  name: string;
  title: string;
  category?: string;
  price?: number;
  isPremium: boolean;
  previewImage?: string;
  slug: string; // Next.js route name (e.g., "classic-gold", "modern-minimal")
  variables?: string[]; // Available variables (e.g., ["event.title", "guest.name", "event.date"])
  assets?: {
    images?: string[];
    colors?: string[];
    fonts?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<TemplateDocument>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      unique: true,
      index: true,
    },
    title: { 
      type: String, 
      required: true, 
      trim: true,
    },
    category: { 
      type: String, 
      trim: true,
      index: true,
    },
    price: { 
      type: Number, 
      min: 0,
    },
    isPremium: { 
      type: Boolean, 
      default: false,
      index: true,
    },
    previewImage: { 
      type: String,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      index: true,
      sparse: true, // Allow null/undefined but enforce uniqueness when present
    },
    variables: {
      type: [String],
      default: [],
    },
    assets: {
      type: {
        images: [String],
        colors: [String],
        fonts: [String],
      },
      default: {},
    },
  },
  { timestamps: true },
);

templateSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const result = ret as Record<string, any>;
    result.id = result._id;
    delete result._id;
    return result;
  },
});

export const TemplateModel: Model<TemplateDocument> = model<TemplateDocument>('Template', templateSchema);

