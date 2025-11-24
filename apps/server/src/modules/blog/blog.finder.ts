import type { FilterQuery } from 'mongoose';
import { FinderService, type PaginationQuery } from '@/common/services/finder.service';
import { BlogModel, type BlogDocument, type BlogStatus } from './blog.model';

export interface BlogFinderQuery extends PaginationQuery, Record<string, unknown> {
  status?: BlogStatus;
  authorId?: string;
  tag?: string;
  keyword?: string;
}

class BlogFinderService extends FinderService<BlogDocument> {
  constructor() {
    super(BlogModel);
  }

  protected buildFilter(query: BlogFinderQuery): FilterQuery<BlogDocument> {
    const filter: FilterQuery<BlogDocument> = {};

    if (query.status) {
      filter.status = query.status;
    } else {
      // By default, only show published blogs for public access
      // This can be overridden by admin users
      filter.status = 'published';
    }

    if (query.authorId) {
      filter.authorId = query.authorId;
    }

    if (query.tag) {
      filter.tags = { $in: [query.tag] };
    }

    if (query.keyword) {
      filter.$or = [
        { title: { $regex: query.keyword, $options: 'i' } },
        { content: { $regex: query.keyword, $options: 'i' } },
        { excerpt: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    return filter;
  }

  async execute(query: BlogFinderQuery) {
    const { page = 1, limit = 20, sort = 'publishedAt', order = 'desc', ...rest } = query;
    const filter = this.buildFilter(rest);

    const [data, total] = await Promise.all([
      BlogModel.find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('authorId', 'firstName lastName email profile')
        .lean()
        .exec(),
      BlogModel.countDocuments(filter),
    ]);

    return {
      data: data as any,
      page,
      limit,
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }
}

export const blogFinderService = new BlogFinderService();

