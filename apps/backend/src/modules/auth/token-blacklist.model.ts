import { Schema, model, type Document, type Model } from 'mongoose';

export interface TokenBlacklistDocument extends Document {
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const tokenBlacklistSchema = new Schema<TokenBlacklistDocument>(
  {
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true },
);

// Create TTL index for automatic cleanup
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklistModel: Model<TokenBlacklistDocument> = model<TokenBlacklistDocument>(
  'TokenBlacklist',
  tokenBlacklistSchema,
);

