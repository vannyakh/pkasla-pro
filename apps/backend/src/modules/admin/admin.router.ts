import { Router } from 'express'; 
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import { authorize } from '@/common/middlewares/authorize';
import { asyncHandler } from '@/utils/async-handler';
import {
  getDashboardHandler,
  getUserMetricsHandler,
  getRevenueStatsHandler,
  getAnalyticsDashboardHandler,
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
import {
  listPaymentLogsHandler,
  getPaymentLogHandler,
  getPaymentLogStatsHandler,
} from '@/modules/payments/payment-log.controller';
import {
  listPaymentLogsQuerySchema,
  getPaymentLogParamsSchema,
  getPaymentLogStatsQuerySchema,
} from '@/modules/payments/payment-log.validation';
import { settingsRouter } from '@/modules/settings';
import {
  createTemplateHandler,
  getTemplateHandler,
  updateTemplateHandler,
  deleteTemplateHandler,
  listTemplatesHandler,
  getCategoriesHandler,
} from '@/modules/t/template.controller';
import {
  createTemplateSchema,
  updateTemplateSchema,
  getTemplateSchema,
  deleteTemplateSchema,
  listTemplatesQuerySchema,
} from '@/modules/t/template.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

const publicTemplateRouter = Router();
publicTemplateRouter.get(
  '/',
  validateRequest(listTemplatesQuerySchema),
  asyncHandler(listTemplatesHandler),
);
publicTemplateRouter.get(
  '/categories',
  asyncHandler(getCategoriesHandler),
);
publicTemplateRouter.get(
  '/:id',
  validateRequest(getTemplateSchema),
  asyncHandler(getTemplateHandler),
);

// Admin-only template routes (write operations)
const adminOnlyTemplateRouter = Router();
adminOnlyTemplateRouter.use(authorize('admin'));
adminOnlyTemplateRouter.post(
  '/',
  validateRequest(createTemplateSchema),
  asyncHandler(createTemplateHandler),
);
adminOnlyTemplateRouter.patch(
  '/:id',
  validateRequest(updateTemplateSchema),
  asyncHandler(updateTemplateHandler),
);
adminOnlyTemplateRouter.delete(
  '/:id',
  validateRequest(deleteTemplateSchema),
  asyncHandler(deleteTemplateHandler),
);

router.use('/t', publicTemplateRouter);
router.use('/t', adminOnlyTemplateRouter);

// All other admin routes require admin role
router.use(authorize('admin'));

// Dashboard & Analytics
router
  .route('/dashboard')
  .get(getDashboardHandler);

router
  .route('/analytics/users')
  .get(getUserMetricsHandler);

router
  .route('/analytics/revenue/stats')
  .get(getRevenueStatsHandler);

router
  .route('/analytics/dashboard')
  .get(getAnalyticsDashboardHandler);

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

// Payment Logs Monitoring
router
  .route('/payments/logs')
  .get(validateRequest(listPaymentLogsQuerySchema), listPaymentLogsHandler);

router
  .route('/payments/logs/stats')
  .get(validateRequest(getPaymentLogStatsQuerySchema), getPaymentLogStatsHandler);

router
  .route('/payments/logs/:id')
  .get(validateRequest(getPaymentLogParamsSchema), getPaymentLogHandler);

export const adminRouter : Router = router;

