import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { buildSuccessResponse } from '@/helpers/http-response';
import { asyncHandler } from '@/utils/async-handler';
import { AppError } from '@/common/errors/app-error';
import { blogService } from './blog.service';

export const createBlogHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const blog = await blogService.create(req.body, req.user.id);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(blog));
});

export const listBlogsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { data, ...meta } = await blogService.list(req.query);
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
});

export const getBlogHandler = asyncHandler(async (req: Request, res: Response) => {
  const blog = await blogService.findById(req.params.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(blog));
});

export const getBlogBySlugHandler = asyncHandler(async (req: Request, res: Response) => {
  const incrementViews = req.query.incrementViews === 'true';
  const blog = await blogService.findBySlug(req.params.slug, incrementViews);
  return res.status(httpStatus.OK).json(buildSuccessResponse(blog));
});

export const updateBlogHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const blog = await blogService.update(req.params.id, req.body, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(blog));
});

export const deleteBlogHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  await blogService.remove(req.params.id, req.user.id);
  return res.status(httpStatus.NO_CONTENT).send();
});

export const getMyBlogsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const { data, ...meta } = await blogService.findByAuthorId(req.user.id, req.query);
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
});

export const updateBlogStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const blog = await blogService.updateStatus(req.params.id, req.body.status, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(blog));
});

