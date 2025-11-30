import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { authenticate } from '@/common/middlewares/authenticate';
import { authorize } from '@/common/middlewares/authorize';
import { validateRequest } from '@/common/middlewares/validate-request';
import {
  listAuditLogsHandler,
  getAuditLogHandler,
  getUserAuditLogsHandler,
  getResourceAuditLogsHandler,
} from './audit-log.controller';
import {
  listAuditLogsQuerySchema,
  getUserAuditLogsQuerySchema,
  getResourceAuditLogsQuerySchema,
} from './audit-log.validation';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// List all audit logs with filters
router.get(
  '/',
  validateRequest(listAuditLogsQuerySchema),
  asyncHandler(listAuditLogsHandler),
);

// Get specific audit log by ID
router.get(
  '/:id',
  asyncHandler(getAuditLogHandler),
);

// Get audit logs for a specific user
router.get(
  '/user/:userId',
  validateRequest(getUserAuditLogsQuerySchema),
  asyncHandler(getUserAuditLogsHandler),
);

// Get audit logs for a specific resource
router.get(
  '/resource/:resource/:resourceId',
  validateRequest(getResourceAuditLogsQuerySchema),
  asyncHandler(getResourceAuditLogsHandler),
);

export const auditLogRouter: Router = router;

