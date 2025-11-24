import type { FilterQuery, UpdateQuery } from 'mongoose';
import { BlogModel, type BlogDocument } from './blog.model';

export class BlogRepository {
  create(payload: Partial<BlogDocument>) {
    return BlogModel.create(payload);
  }

  findById(id: string) {
    return BlogModel.findById(id)
      .populate('authorId', 'firstName lastName email profile')
      .lean();
  }

  findBySlug(slug: string) {
    return BlogModel.findOne({ slug })
      .populate('authorId', 'firstName lastName email profile')
      .lean();
  }

  findByAuthorId(authorId: string, filter: FilterQuery<BlogDocument> = {}, options?: { limit?: number; skip?: number }) {
    const query = BlogModel.find({ authorId, ...filter }).sort({ createdAt: -1 });
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    if (options?.skip) {
      query.skip(options.skip);
    }
    
    return query.populate('authorId', 'firstName lastName email profile').lean();
  }

  updateById(id: string, payload: UpdateQuery<BlogDocument>) {
    return BlogModel.findByIdAndUpdate(id, payload, { new: true })
      .populate('authorId', 'firstName lastName email profile')
      .lean();
  }

  deleteById(id: string) {
    return BlogModel.findByIdAndDelete(id);
  }

  list(filter: FilterQuery<BlogDocument> = {}) {
    return BlogModel.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .populate('authorId', 'firstName lastName email profile')
      .lean();
  }

  count(filter: FilterQuery<BlogDocument> = {}) {
    return BlogModel.countDocuments(filter);
  }

  incrementViews(id: string) {
    return BlogModel.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate('authorId', 'firstName lastName email profile')
      .lean();
  }
}

export const blogRepository = new BlogRepository();

