import { Router } from 'express';
import { authenticate } from '@/common/middlewares/authenticate';
import { createUploadMiddleware, createMultipleUploadMiddleware } from '@/common/middlewares/upload';
import { uploadRateLimiter } from '@/common/middlewares/rate-limit';
import {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  deleteFileById,
  getSignedUrl,
  getStorageInfo,
  getMyUploads,
  getUploadById,
  uploadAvatar,
} from './upload.controller';

const router = Router();

// Get storage provider info (public)
router.get('/info', getStorageInfo);

// All upload routes require authentication
router.use(authenticate);

// Single file upload
router.post('/single', uploadRateLimiter, createUploadMiddleware('file'), uploadFile);

// Avatar upload with compression (accepts both 'file' and 'avatar' field names)
router.post(
  '/avatar',
  uploadRateLimiter,
  createUploadMiddleware('file', {
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB max before compression
  }),
  uploadAvatar,
);

// Multiple files upload
router.post('/multiple', uploadRateLimiter, createMultipleUploadMiddleware('files', 10), uploadMultipleFiles);

// Get my uploads
router.get('/my-uploads', getMyUploads);

// Get signed URL (for R2 private files) - must come before /:id
router.get('/signed-url/:key', getSignedUrl);

// Get upload by ID
router.get('/:id', getUploadById);

// Delete file by ID
router.delete('/:id', deleteFileById);

// Delete file by key
router.delete('/key/:key', deleteFile);

export const uploadRouter: Router = router;

