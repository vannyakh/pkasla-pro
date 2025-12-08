import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { eventService } from './event.service';
import { buildSuccessResponse } from '@/helpers/http-response';
import { storageService } from '@/common/services/storage.service';
import { uploadRepository } from '@/modules/upload/upload.repository';
import { eventRepository } from './event.repository';
import { userSubscriptionService } from '@/modules/subscriptions/user-subscription.service';
import type { EventListFilters } from './event.service';

/**
 * Create a new event
 */
// Helper function to convert relative paths to full URLs
const convertToFullUrl = (url: string | undefined, req: Request): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}${url}`;
  }
  return url;
};

export const createEventHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  // Check event limit based on subscription plan
  // Admins have unlimited events
  if (req.user.role !== 'admin') {
    const maxEvents = await userSubscriptionService.getMaxEventsForUser(req.user.id);
    
    if (maxEvents !== null) {
      const eventCount = await eventRepository.countDocuments({ hostId: req.user.id });
      if (eventCount >= maxEvents) {
        return res.status(httpStatus.FORBIDDEN).json({ 
          error: `You have reached the maximum limit of ${maxEvents} events. Please upgrade your subscription to create more events.` 
        });
      }
    }
  }

  let coverImageUrl: string | undefined;
  let khqrUsdUrl: string | undefined;
  let khqrKhrUrl: string | undefined;

  // Handle file uploads if present
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  
  if (files?.coverImage?.[0]) {
    const file = files.coverImage[0];
    const folder = 'events';
    const customFileName = `cover-${Date.now()}-${file.originalname}`;
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

    coverImageUrl = result.url;
  } else if (req.body.coverImage) {
    coverImageUrl = req.body.coverImage;
  }

  if (files?.khqrUsd?.[0]) {
    const file = files.khqrUsd[0];
    const folder = 'events';
    const customFileName = `khqr-usd-${Date.now()}-${file.originalname}`;
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

    khqrUsdUrl = result.url;
  } else if (req.body.khqrUsd) {
    khqrUsdUrl = req.body.khqrUsd;
  }

  if (files?.khqrKhr?.[0]) {
    const file = files.khqrKhr[0];
    const folder = 'events';
    const customFileName = `khqr-khr-${Date.now()}-${file.originalname}`;
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

    khqrKhrUrl = result.url;
  } else if (req.body.khqrKhr) {
    khqrKhrUrl = req.body.khqrKhr;
  }

  // Convert relative paths to full URLs if they exist in body
  const bodyCoverImage = convertToFullUrl(req.body.coverImage, req);
  const bodyKhqrUsd = convertToFullUrl(req.body.khqrUsd, req);
  const bodyKhqrKhr = convertToFullUrl(req.body.khqrKhr, req);

  const eventData = {
    ...req.body,
    hostId: req.user.id,
    coverImage: coverImageUrl || bodyCoverImage,
    khqrUsd: khqrUsdUrl || bodyKhqrUsd,
    khqrKhr: khqrKhrUrl || bodyKhqrKhr,
    restrictDuplicateNames: req.body.restrictDuplicateNames === 'true' || req.body.restrictDuplicateNames === true,
  };

  const event = await eventService.create(eventData);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(event, 'Event created successfully'));
};

/**
 * Get event by ID
 */
export const getEventHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const event = await eventService.findByIdOrFail(id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(event));
};

/**
 * Update event by ID
 */
export const updateEventHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  let coverImageUrl: string | undefined;
  let khqrUsdUrl: string | undefined;
  let khqrKhrUrl: string | undefined;

  // Handle file uploads if present
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  
  if (files?.coverImage?.[0]) {
    const file = files.coverImage[0];
    const folder = 'events';
    const customFileName = `cover-${Date.now()}-${file.originalname}`;
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

    coverImageUrl = result.url;
  } else if (req.body.coverImage !== undefined) {
    coverImageUrl = req.body.coverImage || undefined;
  }

  if (files?.khqrUsd?.[0]) {
    const file = files.khqrUsd[0];
    const folder = 'events';
    const customFileName = `khqr-usd-${Date.now()}-${file.originalname}`;
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

    khqrUsdUrl = result.url;
  } else if (req.body.khqrUsd !== undefined) {
    khqrUsdUrl = req.body.khqrUsd || undefined;
  }

  if (files?.khqrKhr?.[0]) {
    const file = files.khqrKhr[0];
    const folder = 'events';
    const customFileName = `khqr-khr-${Date.now()}-${file.originalname}`;
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

    khqrKhrUrl = result.url;
  } else if (req.body.khqrKhr !== undefined) {
    khqrKhrUrl = req.body.khqrKhr || undefined;
  }

  const updateData: any = { ...req.body };
  if (coverImageUrl !== undefined) {
    updateData.coverImage = coverImageUrl;
  } else if (req.body.coverImage !== undefined) {
    updateData.coverImage = convertToFullUrl(req.body.coverImage, req);
  }
  if (khqrUsdUrl !== undefined) {
    updateData.khqrUsd = khqrUsdUrl;
  } else if (req.body.khqrUsd !== undefined) {
    updateData.khqrUsd = convertToFullUrl(req.body.khqrUsd, req);
  }
  if (khqrKhrUrl !== undefined) {
    updateData.khqrKhr = khqrKhrUrl;
  } else if (req.body.khqrKhr !== undefined) {
    updateData.khqrKhr = convertToFullUrl(req.body.khqrKhr, req);
  }
  if (req.body.restrictDuplicateNames !== undefined) {
    updateData.restrictDuplicateNames = req.body.restrictDuplicateNames === 'true' || req.body.restrictDuplicateNames === true;
  }

  const event = await eventService.updateById(id, updateData, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(event, 'Event updated successfully'));
};

/**
 * Delete event by ID
 */
export const deleteEventHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  await eventService.deleteById(id, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(null, 'Event deleted successfully'));
};

/**
 * List events with pagination and filters
 */
export const listEventsHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  
  const filters: EventListFilters = {};
  
  if (req.query.hostId) {
    filters.hostId = req.query.hostId as string;
  }
  
  if (req.query.status) {
    filters.status = req.query.status as EventListFilters['status'];
  }
  
  if (req.query.eventType) {
    filters.eventType = req.query.eventType as EventListFilters['eventType'];
  }
  
  if (req.query.search) {
    filters.search = req.query.search as string;
  }

  if (req.query.dateFrom) {
    filters.dateFrom = req.query.dateFrom as string;
  }

  if (req.query.dateTo) {
    filters.dateTo = req.query.dateTo as string;
  }
  
  const result = await eventService.list(page, pageSize, filters);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

/**
 * Get events by current user (host)
 */
export const getMyEventsHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const events = await eventService.findByHostId(req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(events));
};

/**
 * Get all event categories (types)
 */
export const getEventCategoriesHandler = async (req: Request, res: Response) => {
  const categories = await eventService.getEventCategories();
  return res.status(httpStatus.OK).json(buildSuccessResponse(categories));
};

/**
 * Get events by type with pagination
 */
export const getEventsByTypeHandler = async (req: Request, res: Response) => {
  const { eventType } = req.params;
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;

  const result = await eventService.findByEventType(eventType as any, page, pageSize);
  return res.status(httpStatus.OK).json(buildSuccessResponse(result));
};

/**
 * Generate or regenerate QR code token for event
 */
export const generateQRCodeTokenHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  const token = await eventService.generateQRCodeToken(id, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse({ token }, 'QR code token generated successfully'));
};

/**
 * Get event by QR code token (public endpoint for scanning)
 */
export const getEventByQRTokenHandler = async (req: Request, res: Response) => {
  const { token } = req.params;
  const event = await eventService.findByQRCodeToken(token);
  
  if (!event) {
    return res.status(httpStatus.NOT_FOUND).json({ error: 'Event not found or invalid QR code' });
  }

  return res.status(httpStatus.OK).json(buildSuccessResponse(event));
};

