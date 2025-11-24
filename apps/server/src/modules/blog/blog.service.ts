import httpStatus from 'http-status';
import type { z } from 'zod';
import { AppError } from '@/common/errors/app-error';
import { blogRepository } from './blog.repository';
import { blogFinderService, type BlogFinderQuery } from './blog.finder';
import { createBlogSchema, updateBlogSchema } from './blog.validation';
import type { BlogStatus } from './blog.model';

export type CreateBlogInput = z.infer<typeof createBlogSchema>['body'];
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>['body'];

class BlogService {
  async create(payload: CreateBlogInput, authorId: string) {
    // Generate slug from title if not provided
    const slug = payload.slug || this.generateSlug(payload.title);
    
    // Check if slug already exists
    const existingBlog = await blogRepository.findBySlug(slug);
    if (existingBlog) {
      throw new AppError('A blog with this slug already exists', httpStatus.CONFLICT);
    }

    const blogData: any = {
      ...payload,
      slug,
      authorId: authorId as any,
    };

    // Set publishedAt if status is published
    if (payload.status === 'published') {
      blogData.publishedAt = new Date();
    }

    return blogRepository.create(blogData);
  }

  async findById(id: string) {
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new AppError('Blog not found', httpStatus.NOT_FOUND);
    }
    return blog;
  }

  async findBySlug(slug: string, incrementViews = false) {
    const blog = await blogRepository.findBySlug(slug);
    if (!blog) {
      throw new AppError('Blog not found', httpStatus.NOT_FOUND);
    }

    // Increment views if requested
    if (incrementViews && blog.status === 'published') {
      return blogRepository.incrementViews(blog.id);
    }

    return blog;
  }

  async update(id: string, payload: UpdateBlogInput, authorId?: string) {
    const existingBlog = await this.findById(id);

    // Check if user is the author or admin
    if (authorId && existingBlog.authorId.toString() !== authorId) {
      throw new AppError('You can only update your own blogs', httpStatus.FORBIDDEN);
    }

    // Handle slug update
    if (payload.slug && payload.slug !== existingBlog.slug) {
      const slugExists = await blogRepository.findBySlug(payload.slug);
      if (slugExists) {
        throw new AppError('A blog with this slug already exists', httpStatus.CONFLICT);
      }
    }

    // Generate slug from title if title is updated but slug is not
    if (payload.title && !payload.slug) {
      const newSlug = this.generateSlug(payload.title);
      if (newSlug !== existingBlog.slug) {
        const slugExists = await blogRepository.findBySlug(newSlug);
        if (!slugExists) {
          payload.slug = newSlug;
        }
      }
    }

    const updateData: any = { ...payload };

    // Set publishedAt if status is being changed to published
    if (payload.status === 'published' && existingBlog.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    const updated = await blogRepository.updateById(id, updateData);
    if (!updated) {
      throw new AppError('Blog not found', httpStatus.NOT_FOUND);
    }
    return updated;
  }

  async remove(id: string, authorId?: string) {
    const blog = await this.findById(id);

    // Check if user is the author or admin
    if (authorId && blog.authorId.toString() !== authorId) {
      throw new AppError('You can only delete your own blogs', httpStatus.FORBIDDEN);
    }

    const deleted = await blogRepository.deleteById(id);
    if (!deleted) {
      throw new AppError('Blog not found', httpStatus.NOT_FOUND);
    }
    return deleted;
  }

  list(query: BlogFinderQuery) {
    return blogFinderService.execute(query);
  }

  async findByAuthorId(authorId: string, query: BlogFinderQuery = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      blogRepository.findByAuthorId(authorId, {}, { limit, skip }),
      blogRepository.count({ authorId }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async updateStatus(id: string, status: BlogStatus, authorId?: string) {
    const blog = await this.findById(id);

    // Check if user is the author or admin
    if (authorId && blog.authorId.toString() !== authorId) {
      throw new AppError('You can only update your own blogs', httpStatus.FORBIDDEN);
    }

    const updateData: any = { status };
    if (status === 'published' && blog.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    return this.update(id, updateData, authorId);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100); // Limit length
  }
}

export const blogService = new BlogService();

