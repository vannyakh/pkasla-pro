import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { giftService } from './gift.service';
import { buildSuccessResponse } from '@/helpers/http-response';
import { storageService } from '@/common/services/storage.service';
import { uploadRepository } from '@/modules/upload/upload.repository';

/**
 * Create a new gift payment
 */
export const createGiftHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  let receiptImageUrl: string | undefined;

  // Handle receipt image file upload if present
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  
  if (files?.receiptImage?.[0]) {
    const file = files.receiptImage[0];
    const folder = 'gifts';
    const customFileName = `receipt-${Date.now()}-${file.originalname}`;
    const result = await storageService.uploadFile(file, folder, customFileName);

    if (req.user) {
      await uploadRepository.create({
        userId: req.user.id as any,
        originalFilename: file.originalname,
        filename: result.key.split('/').pop() || file.originalname,
        url: result.url,
        key: result.key,
        provider: result.provider,
        mimetype: file.mimetype,
        size: file.size,
        folder,
      });
    }

    receiptImageUrl = result.url;
  } else if (req.body.receiptImage) {
    receiptImageUrl = req.body.receiptImage;
  }

  const giftData = {
    ...req.body,
    amount: parseFloat(req.body.amount),
    receiptImage: receiptImageUrl,
  };

  const gift = await giftService.create(giftData, req.user.id);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(gift, 'Gift payment recorded successfully'));
};

/**
 * Get gift by ID
 */
export const getGiftHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const gift = await giftService.findByIdOrFail(id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(gift));
};

/**
 * Update gift by ID
 */
export const updateGiftHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  let receiptImageUrl: string | undefined;

  // Handle receipt image file upload if present
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  
  if (files?.receiptImage?.[0]) {
    const file = files.receiptImage[0];
    const folder = 'gifts';
    const customFileName = `receipt-${Date.now()}-${file.originalname}`;
    const result = await storageService.uploadFile(file, folder, customFileName);

    if (req.user) {
      await uploadRepository.create({
        userId: req.user.id as any,
        originalFilename: file.originalname,
        filename: result.key.split('/').pop() || file.originalname,
        url: result.url,
        key: result.key,
        provider: result.provider,
        mimetype: file.mimetype,
        size: file.size,
        folder,
      });
    }

    receiptImageUrl = result.url;
  } else if (req.body.receiptImage !== undefined) {
    receiptImageUrl = req.body.receiptImage || undefined;
  }

  const updateData: any = {
    ...req.body,
  };

  if (req.body.amount !== undefined) {
    updateData.amount = parseFloat(req.body.amount);
  }

  if (receiptImageUrl !== undefined) {
    updateData.receiptImage = receiptImageUrl;
  }

  const gift = await giftService.updateById(id, updateData, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(gift, 'Gift payment updated successfully'));
};

/**
 * Delete gift by ID
 */
export const deleteGiftHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  await giftService.deleteById(id, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(null, 'Gift payment deleted successfully'));
};

/**
 * List gifts with pagination and filters
 */
export const listGiftsHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  
  const filters: {
    guestId?: string;
    eventId?: string;
    paymentMethod?: 'cash' | 'khqr';
    currency?: 'khr' | 'usd';
  } = {};
  
  if (req.query.guestId) {
    filters.guestId = req.query.guestId as string;
  }
  
  if (req.query.eventId) {
    filters.eventId = req.query.eventId as string;
  }
  
  if (req.query.paymentMethod) {
    filters.paymentMethod = req.query.paymentMethod as 'cash' | 'khqr';
  }
  
  if (req.query.currency) {
    filters.currency = req.query.currency as 'khr' | 'usd';
  }
  
  const result = await giftService.list(page, pageSize, filters);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

/**
 * Get gifts by guest ID
 */
export const getGiftsByGuestHandler = async (req: Request, res: Response) => {
  const { guestId } = req.params;
  const gifts = await giftService.findByGuestId(guestId);
  return res.status(httpStatus.OK).json(buildSuccessResponse(gifts));
};

/**
 * Get gifts by event ID
 */
export const getGiftsByEventHandler = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const gifts = await giftService.findByEventId(eventId);
  return res.status(httpStatus.OK).json(buildSuccessResponse(gifts));
};

