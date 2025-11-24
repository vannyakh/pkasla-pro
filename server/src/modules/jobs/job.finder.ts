import type { FilterQuery } from 'mongoose';
import { FinderService, type PaginationQuery, type FinderResult } from '@/common/services/finder.service';
import { cacheService } from '@/common/services/cache.service';
import { JobModel, type JobDocument } from './job.model';

export interface JobFinderQuery extends PaginationQuery, Record<string, unknown> {
  sortBy?: 
    | 'newest_first'
    | 'oldest_first'
    | 'salary_high_to_low'
    | 'salary_low_to_high'
    | 'company_a_to_z'
    | 'company_z_to_a'
    | 'title_a_to_z'
    | 'title_z_to_a';
  keyword?: string;
  location?: string;
  tags?: string | string[];
  employmentType?: JobDocument['employmentType'];
  isRemote?: boolean;
  status?: JobDocument['status'];
}

class JobFinderService extends FinderService<JobDocument> {
  constructor() {
    super(JobModel);
  }

  /**
   * Generate cache key from query parameters
   */
  private getCacheKey(query: JobFinderQuery): string {
    const keyParts = [
      'jobs',
      query.page || 1,
      query.limit || 20,
      query.sortBy || query.sort || 'default',
      query.order || 'desc',
      query.keyword || '',
      query.location || '',
      Array.isArray(query.tags) ? query.tags.join(',') : query.tags || '',
      query.employmentType || '',
      query.isRemote !== undefined ? String(query.isRemote) : '',
      query.status || 'published',
    ];
    return `job:list:${keyParts.join(':')}`;
  }

  /**
   * Maps sortBy enum to MongoDB sort object
   */
  private getSortFromSortBy(sortBy?: string): { [key: string]: 1 | -1 } {
    if (!sortBy) {
      return { createdAt: -1 }; // Default: newest first
    }

    const sortMap: Record<string, { [key: string]: 1 | -1 }> = {
      newest_first: { createdAt: -1 },
      oldest_first: { createdAt: 1 },
      salary_high_to_low: { 'salaryRange.max': -1 },
      salary_low_to_high: { 'salaryRange.max': 1 },
      company_a_to_z: { company: 1 },
      company_z_to_a: { company: -1 },
      title_a_to_z: { title: 1 },
      title_z_to_a: { title: -1 },
    };

    return sortMap[sortBy] || { createdAt: -1 };
  }

  async execute(query: JobFinderQuery): Promise<FinderResult<JobDocument>> {
    const cacheKey = this.getCacheKey(query);

    // Try to get from cache first
    const cached = await cacheService.get<FinderResult<JobDocument>>(cacheKey);
    if (cached) {
      return cached;
    }

    const { page = 1, limit = 20, sortBy, sort, order = 'desc', ...rest } = query;
    const filter = this.buildFilter(rest);

    // Use sortBy if provided, otherwise fall back to legacy sort/order
    const sortObject: { [key: string]: 1 | -1 } = sortBy
      ? this.getSortFromSortBy(sortBy)
      : { [sort || 'createdAt']: order === 'desc' ? -1 : 1 };

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sortObject as any)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter),
    ]);

    const result: FinderResult<JobDocument> = {
      data,
      page,
      limit,
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };

    // Cache the result (5 minutes for job listings)
    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Invalidate job cache (call this when jobs are created/updated/deleted)
   */
  async invalidateCache(): Promise<void> {
    await cacheService.delPattern('job:*');
  }

  protected buildFilter(query: JobFinderQuery): FilterQuery<JobDocument> {
    const filter: FilterQuery<JobDocument> = {};

    // By default, only show published and approved jobs for public access
    if (!query.status) {
      filter.status = 'published';
    }
    filter.approvalStatus = 'approved';

    if (query.keyword) {
      filter.$or = [
        { title: { $regex: query.keyword, $options: 'i' } },
        { company: { $regex: query.keyword, $options: 'i' } },
        { description: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    if (query.location) {
      filter.location = { $regex: query.location, $options: 'i' };
    }

    if (query.tags) {
      const tags = Array.isArray(query.tags) ? query.tags : query.tags.split(',');
      filter.tags = { $all: tags.map((tag) => tag.trim()).filter(Boolean) };
    }

    if (typeof query.isRemote === 'boolean') {
      filter.isRemote = query.isRemote;
    }

    if (query.employmentType) {
      filter.employmentType = query.employmentType;
    }

    if (query.status) {
      filter.status = query.status;
    }

    return filter;
  }
}

export const jobFinderService = new JobFinderService();

