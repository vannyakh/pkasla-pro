import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import { authorize } from '@/common/middlewares/authorize';
import {
  createBlogHandler,
  deleteBlogHandler,
  getBlogBySlugHandler,
  getBlogHandler,
  getMyBlogsHandler,
  listBlogsHandler,
  updateBlogHandler,
  updateBlogStatusHandler,
} from './blog.controller';
import {
  createBlogSchema,
  blogQuerySchema,
  updateBlogSchema,
  updateBlogStatusSchema,
} from './blog.validation';

const router = Router();

// Public routes - get published blogs
router
  .route('/')
  .get(validateRequest(blogQuerySchema), asyncHandler(listBlogsHandler))
  .post(authenticate, validateRequest(createBlogSchema), asyncHandler(createBlogHandler));

// Get blog by slug (public)
router
  .route('/slug/:slug')
  .get(validateRequest(blogQuerySchema), asyncHandler(getBlogBySlugHandler));

// User's own blogs
router
  .route('/my-blogs')
  .get(authenticate, validateRequest(blogQuerySchema), asyncHandler(getMyBlogsHandler));

// Blog routes
router
  .route('/:id')
  .get(asyncHandler(getBlogHandler))
  .patch(authenticate, validateRequest(updateBlogSchema), asyncHandler(updateBlogHandler))
  .delete(authenticate, asyncHandler(deleteBlogHandler));

// Update blog status
router
  .route('/:id/status')
  .patch(authenticate, validateRequest(updateBlogStatusSchema), asyncHandler(updateBlogStatusHandler));

export const blogRouter = router;

