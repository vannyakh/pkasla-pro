import type { Document, FilterQuery, Model } from 'mongoose';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FinderResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export abstract class FinderService<T extends Document> {
  private readonly DEFAULT_LIMIT = 20;

  protected constructor(protected readonly model: Model<T>) {}

  protected abstract buildFilter(query: unknown): FilterQuery<T>;

  async execute(query: PaginationQuery & Record<string, unknown>): Promise<FinderResult<T>> {
    const { page = 1, limit = this.DEFAULT_LIMIT, sort = 'createdAt', order = 'desc', ...rest } = query;
    const filter = this.buildFilter(rest);

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      page,
      limit,
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }
}

