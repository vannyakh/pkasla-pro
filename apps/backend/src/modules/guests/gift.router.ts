import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import { createFieldsUploadMiddleware } from '@/common/middlewares/upload';
import {
  createGiftHandler,
  getGiftHandler,
  updateGiftHandler,
  deleteGiftHandler,
  listGiftsHandler,
  getGiftsByGuestHandler,
  getGiftsByEventHandler,
} from './gift.controller';
import {
  createGiftSchema,
  updateGiftSchema,
  getGiftSchema,
  deleteGiftSchema,
  listGiftsQuerySchema,
} from './gift.validation';

const router = Router();

// List gifts with pagination and filters
router.get(
  '/',
  validateRequest(listGiftsQuerySchema),
  asyncHandler(listGiftsHandler),
);

// Get gifts by guest ID
router.get(
  '/guest/:guestId',
  asyncHandler(getGiftsByGuestHandler),
);

// Get gifts by event ID
router.get(
  '/event/:eventId',
  asyncHandler(getGiftsByEventHandler),
);

// Get gift by ID
router.get(
  '/:id',
  validateRequest(getGiftSchema),
  asyncHandler(getGiftHandler),
);

// Create new gift payment (authenticated, host only)
router.post(
  '/',
  authenticate,
  createFieldsUploadMiddleware('receiptImage', { allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] }),
  validateRequest(createGiftSchema),
  asyncHandler(createGiftHandler),
);

// Update gift by ID (authenticated, host only)
router.patch(
  '/:id',
  authenticate,
  createFieldsUploadMiddleware('receiptImage', { allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] }),
  validateRequest(updateGiftSchema),
  asyncHandler(updateGiftHandler),
);

// Delete gift by ID (authenticated, host only)
router.delete(
  '/:id',
  authenticate,
  validateRequest(deleteGiftSchema),
  asyncHandler(deleteGiftHandler),
);

export const giftRouter: Router = router;

