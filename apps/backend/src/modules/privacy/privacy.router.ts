import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { authenticate } from '@/common/middlewares/authenticate';
import {
  exportUserDataHandler,
  deleteUserDataHandler,
  anonymizeUserDataHandler,
  getDataRetentionInfoHandler,
  requestDataDeletionHandler,
} from './privacy.controller';

const router = Router();

// All privacy routes require authentication
router.use(authenticate);

// GDPR compliance routes
router
  .route('/export')
  .get(asyncHandler(exportUserDataHandler));

router
  .route('/delete')
  .post(asyncHandler(deleteUserDataHandler));

router
  .route('/anonymize')
  .post(asyncHandler(anonymizeUserDataHandler));

router
  .route('/retention')
  .get(asyncHandler(getDataRetentionInfoHandler));

router
  .route('/request-deletion')
  .post(asyncHandler(requestDataDeletionHandler));

export const privacyRouter = router;

