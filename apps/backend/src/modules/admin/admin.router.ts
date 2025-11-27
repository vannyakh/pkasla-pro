import { Router } from 'express'; 
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import { authorize } from '@/common/middlewares/authorize';
import {
  getDashboardHandler,
  getUserMetricsHandler,
  listUsersHandler,
  updateUserStatusHandler,
  updateUserRoleHandler,
  clearCacheHandler,
} from './admin.controller';
import {
  updateUserStatusSchema,
  updateUserRoleSchema,
  adminQuerySchema,
} from './admin.validation';
import { settingsRouter } from '@/modules/settings';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard & Analytics
router
  .route('/dashboard')
  .get(getDashboardHandler);

router
  .route('/analytics/users')
  .get(getUserMetricsHandler);

// User Management
router
  .route('/users')
  .get(validateRequest(adminQuerySchema), listUsersHandler);

router
  .route('/users/:id/status')
  .patch(validateRequest(updateUserStatusSchema), updateUserStatusHandler);

router
  .route('/users/:id/role')
  .patch(validateRequest(updateUserRoleSchema), updateUserRoleHandler);

// Settings routes
router.use('/settings', settingsRouter);

// Cache Management
router.route('/cache/clear').post(clearCacheHandler);

export const adminRouter : Router = router;

