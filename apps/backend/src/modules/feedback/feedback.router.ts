import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import { authorize } from '@/common/middlewares/authorize';
import {
  createFeedbackHandler,
  deleteFeedbackHandler,
  getFeedbackHandler,
  getUserFeedbacksHandler,
  listFeedbacksHandler,
  respondToFeedbackHandler,
  updateFeedbackHandler,
} from './feedback.controller';
import {
  createFeedbackSchema,
  feedbackQuerySchema,
  respondToFeedbackSchema,
  updateFeedbackSchema,
} from './feedback.validation';

const router = Router();

// Public routes (authenticated users can create feedback)
router
  .route('/')
  .post(authenticate, validateRequest(createFeedbackSchema), asyncHandler(createFeedbackHandler))
  .get(
    authenticate,
    authorize('admin'),
    validateRequest(feedbackQuerySchema),
    asyncHandler(listFeedbacksHandler),
  );

// User's own feedbacks
router
  .route('/my-feedbacks')
  .get(authenticate, validateRequest(feedbackQuerySchema), asyncHandler(getUserFeedbacksHandler));

// Admin routes
router
  .route('/:id')
  .get(authenticate, asyncHandler(getFeedbackHandler))
  .patch(
    authenticate,
    authorize('admin'),
    validateRequest(updateFeedbackSchema),
    asyncHandler(updateFeedbackHandler),
  )
  .delete(authenticate, authorize('admin'), asyncHandler(deleteFeedbackHandler));

// Respond to feedback (admin only)
router
  .route('/:id/respond')
  .post(
    authenticate,
    authorize('admin'),
    validateRequest(respondToFeedbackSchema),
    asyncHandler(respondToFeedbackHandler),
  );

export const feedbackRouter : Router = router;

