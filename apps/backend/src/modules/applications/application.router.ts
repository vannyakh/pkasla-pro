import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import { authorize } from '@/common/middlewares/authorize';
import {
  createApplicationHandler,
  deleteApplicationHandler,
  getApplicationHandler,
  getApplicationStatsHandler,
  getJobApplicationsHandler,
  getMyApplicationsHandler,
  updateApplicationHandler,
  updateApplicationStatusHandler,
} from './application.controller';
import {
  createApplicationSchema,
  applicationQuerySchema,
  updateApplicationSchema,
} from './application.validation';

const router = Router();

// Create application (authenticated candidates)
router
  .route('/')
  .post(authenticate, validateRequest(createApplicationSchema), asyncHandler(createApplicationHandler));

// Get my applications (authenticated candidates)
router
  .route('/my-applications')
  .get(authenticate, validateRequest(applicationQuerySchema), asyncHandler(getMyApplicationsHandler));

// Application stats (admin/recruiter)
router
  .route('/stats')
  .get(authenticate, authorize('admin', 'recruiter'), asyncHandler(getApplicationStatsHandler));

// Job applications (admin/recruiter)
router
  .route('/job/:jobId')
  .get(authenticate, authorize('admin', 'recruiter'), validateRequest(applicationQuerySchema), asyncHandler(getJobApplicationsHandler));

// Application routes
router
  .route('/:id')
  .get(authenticate, asyncHandler(getApplicationHandler))
  .patch(authenticate, validateRequest(updateApplicationSchema), asyncHandler(updateApplicationHandler))
  .delete(authenticate, asyncHandler(deleteApplicationHandler));

// Update application status (admin/recruiter)
router
  .route('/:id/status')
  .patch(authenticate, authorize('admin', 'recruiter'), validateRequest(updateApplicationSchema), asyncHandler(updateApplicationStatusHandler));

export const applicationRouter = router;

