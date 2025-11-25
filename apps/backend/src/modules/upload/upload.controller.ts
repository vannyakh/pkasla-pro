import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { storageService } from '@/common/services/storage.service';
import { buildSuccessResponse } from '@/helpers/http-response';
import { asyncHandler } from '@/utils/async-handler';
import { AppError } from '@/common/errors/app-error';
import { uploadRepository } from './upload.repository';
import { compressAvatar } from '@/utils/image-compression';

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file provided', httpStatus.BAD_REQUEST);
  }

  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const folder = (req.body.folder as string) || 'general';
  const customFileName = req.body.filename as string | undefined;

  const result = await storageService.uploadFile(req.file, folder, customFileName);

  // Save upload record to database
  const uploadRecord = await uploadRepository.create({
    userId: req.user.id as any,
    originalFilename: req.file.originalname,
    filename: result.key.split('/').pop() || req.file.originalname,
    url: result.url,
    key: result.key,
    provider: result.provider,
    mimetype: req.file.mimetype,
    size: req.file.size,
    folder,
  });

  res.status(httpStatus.OK).json(
    buildSuccessResponse({
      id: uploadRecord.id,
      url: result.url,
      key: result.key,
      provider: result.provider,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      folder,
      createdAt: uploadRecord.createdAt,
    }),
  );
});

export const uploadMultipleFiles = asyncHandler(async (req: Request, res: Response) => {
  const uploadedFiles = req.files as Express.Multer.File[];
  
  if (!uploadedFiles || uploadedFiles.length === 0) {
    throw new AppError('No files provided', httpStatus.BAD_REQUEST);
  }

  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const folder = (req.body.folder as string) || 'general';

  const uploadPromises = uploadedFiles.map((file) => storageService.uploadFile(file, folder));
  const results = await Promise.all(uploadPromises);

  // Save upload records to database
  const uploadRecords = await Promise.all(
    results.map((result, index) =>
      uploadRepository.create({
        userId: req.user!.id as any,
        originalFilename: uploadedFiles[index].originalname,
        filename: result.key.split('/').pop() || uploadedFiles[index].originalname,
        url: result.url,
        key: result.key,
        provider: result.provider,
        mimetype: uploadedFiles[index].mimetype,
        size: uploadedFiles[index].size,
        folder,
      }),
    ),
  );

  res.status(httpStatus.OK).json(
    buildSuccessResponse(
      uploadRecords.map((record, index) => ({
        id: record.id,
        url: results[index].url,
        key: results[index].key,
        provider: results[index].provider,
        filename: uploadedFiles[index].originalname,
        mimetype: uploadedFiles[index].mimetype,
        size: uploadedFiles[index].size,
        folder,
        createdAt: record.createdAt,
      })),
    ),
  );
});

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const key = req.params.key;

  if (!key) {
    throw new AppError('File key is required', httpStatus.BAD_REQUEST);
  }

  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  // Find upload record
  const uploadRecord = await uploadRepository.findByKey(key);

  if (!uploadRecord) {
    throw new AppError('Upload record not found', httpStatus.NOT_FOUND);
  }

  // Check if user owns the file or is admin
  if (uploadRecord.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to delete this file', httpStatus.FORBIDDEN);
  }

  // Delete from storage
  await storageService.deleteFile(key);

  // Delete from database
  await uploadRepository.deleteByKey(key);

  res.status(httpStatus.OK).json(
    buildSuccessResponse({
      message: 'File deleted successfully',
    }),
  );
});

export const deleteFileById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('Upload ID is required', httpStatus.BAD_REQUEST);
  }

  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  // Find upload record
  const uploadRecord = await uploadRepository.findById(id);

  if (!uploadRecord) {
    throw new AppError('Upload record not found', httpStatus.NOT_FOUND);
  }

  // Check if user owns the file or is admin
  if (uploadRecord.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to delete this file', httpStatus.FORBIDDEN);
  }

  // Delete from storage
  await storageService.deleteFile(uploadRecord.key);

  // Delete from database
  await uploadRepository.deleteById(id);

  res.status(httpStatus.OK).json(
    buildSuccessResponse({
      message: 'File deleted successfully',
    }),
  );
});

export const getSignedUrl = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const expiresIn = req.query.expiresIn ? Number(req.query.expiresIn) : 3600;

  if (!key) {
    throw new AppError('File key is required', httpStatus.BAD_REQUEST);
  }

  const signedUrl = await storageService.getSignedUrl(key, expiresIn);

  res.status(httpStatus.OK).json(
    buildSuccessResponse({
      signedUrl,
      expiresIn,
    }),
  );
});

export const getStorageInfo = asyncHandler(async (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json(
    buildSuccessResponse({
      provider: storageService.getProvider(),
    }),
  );
});

export const getMyUploads = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const folder = req.query.folder as string | undefined;
  const filter = folder ? { folder } : {};

  const uploads = await uploadRepository.findByUserId(req.user.id, filter);

  res.status(httpStatus.OK).json(buildSuccessResponse(uploads));
});

export const getUploadById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('Upload ID is required', httpStatus.BAD_REQUEST);
  }

  const upload = await uploadRepository.findById(id);

  if (!upload) {
    throw new AppError('Upload not found', httpStatus.NOT_FOUND);
  }

  // Check if user owns the file or is admin
  if (req.user && upload.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to view this file', httpStatus.FORBIDDEN);
  }

  res.status(httpStatus.OK).json(buildSuccessResponse(upload));
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  // Accept both 'file' and 'avatar' field names for flexibility
  const file = req.file || (req as any).files?.[0];
  
  if (!file) {
    throw new AppError('No file provided', httpStatus.BAD_REQUEST);
  }

  // Validate that the file is an image
  if (!file.mimetype.startsWith('image/')) {
    throw new AppError('File must be an image', httpStatus.BAD_REQUEST);
  }

  // Compress the image
  const { buffer: compressedBuffer, mimetype, size: compressedSize } = await compressAvatar(file.buffer);

  // Create a new file object with compressed data
  const compressedFile: Express.Multer.File = {
    ...file,
    buffer: compressedBuffer,
    mimetype,
    size: compressedSize,
  };

  // Upload to storage in 'avatars' folder
  const folder = 'avatars';
  const customFileName = `avatar-${req.user.id}-${Date.now()}.jpg`;
  const result = await storageService.uploadFile(compressedFile, folder, customFileName);

  // Save upload record to database
  const uploadRecord = await uploadRepository.create({
    userId: req.user.id as any,
    originalFilename: file.originalname,
    filename: result.key.split('/').pop() || customFileName,
    url: result.url,
    key: result.key,
    provider: result.provider,
    mimetype: compressedFile.mimetype,
    size: compressedSize,
    folder,
  });

  res.status(httpStatus.OK).json(
    buildSuccessResponse({
      id: uploadRecord.id,
      url: result.url,
      key: result.key,
      provider: result.provider,
      filename: file.originalname,
      mimetype: compressedFile.mimetype,
      size: compressedSize,
      originalSize: file.size,
      compressionRatio: ((1 - compressedSize / file.size) * 100).toFixed(2) + '%',
      folder,
      createdAt: uploadRecord.createdAt,
    }),
  );
});

