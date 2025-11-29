import multer from 'multer';
import type { Request } from 'express';
import type { RequestHandler } from 'express-serve-static-core';
import { AppError } from '@/common/errors/app-error';
import httpStatus from 'http-status';

export interface FileFilterOptions {
  allowedMimeTypes?: string[];
  maxSize?: number; // in bytes
}

const defaultOptions: FileFilterOptions = {
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  maxSize: 5 * 1024 * 1024, // 5MB
};

export const createUploadMiddleware = (
  fieldName: string = 'file',
  options: FileFilterOptions = {},
): RequestHandler => {
  const config = { ...defaultOptions, ...options };

  const storage = multer.memoryStorage();

  const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (config.allowedMimeTypes && !config.allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new AppError(
          `Invalid file type. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
          httpStatus.BAD_REQUEST,
        ),
      );
    }
    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: config.maxSize,
    },
  });

  return upload.single(fieldName);
};

export const createMultipleUploadMiddleware = (
  fieldName: string = 'files',
  maxCount: number = 5,
  options: FileFilterOptions = {},
): RequestHandler => {
  const config = { ...defaultOptions, ...options };

  const storage = multer.memoryStorage();

  const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (config.allowedMimeTypes && !config.allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new AppError(
          `Invalid file type. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
          httpStatus.BAD_REQUEST,
        ),
      );
    }
    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: config.maxSize,
    },
  });

  return upload.array(fieldName, maxCount);
};

export const createFieldsUploadMiddleware = (
  fields: string | string[],
  options: FileFilterOptions = {},
): RequestHandler => {
  const config = { ...defaultOptions, ...options };

  const storage = multer.memoryStorage();

  const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (config.allowedMimeTypes && !config.allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new AppError(
          `Invalid file type. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
          httpStatus.BAD_REQUEST,
        ),
      );
    }
    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: config.maxSize,
    },
  });

  // Convert single field name to array format for multer.fields
  const fieldsArray = Array.isArray(fields)
    ? fields.map((name) => ({ name, maxCount: 1 }))
    : [{ name: fields, maxCount: 1 }];

  return upload.fields(fieldsArray);
};

