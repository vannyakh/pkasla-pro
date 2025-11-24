import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import { authorize } from '@/common/middlewares/authorize';
import {
  createJobHandler,
  deleteJobHandler,
  getJobHandler,
  getSavedJobsHandler,
  listJobsHandler,
  saveJobHandler,
  unsaveJobHandler,
  updateJobHandler,
} from './job.controller';
import { createJobSchema, jobQuerySchema, savedJobsQuerySchema, updateJobSchema } from './job.validation';

const router = Router();

router
  .route('/')
  .get(validateRequest(jobQuerySchema), asyncHandler(listJobsHandler))
  .post(
    authenticate,
    authorize('admin', 'recruiter'),
    validateRequest(createJobSchema),
    asyncHandler(createJobHandler),
  );

// Saved jobs routes (must be before /:id to avoid route conflicts)
router
  .route('/saved-jobs')
  .get(authenticate, validateRequest(savedJobsQuerySchema), asyncHandler(getSavedJobsHandler));

router
  .route('/:id/save')
  .post(authenticate, asyncHandler(saveJobHandler))
  .delete(authenticate, asyncHandler(unsaveJobHandler));

router
  .route('/:id')
  .get(asyncHandler(getJobHandler))
  .patch(
    authenticate,
    authorize('admin', 'recruiter'),
    validateRequest(updateJobSchema),
    asyncHandler(updateJobHandler),
  )
  .delete(authenticate, authorize('admin', 'recruiter'), asyncHandler(deleteJobHandler));

export const jobRouter = router;

