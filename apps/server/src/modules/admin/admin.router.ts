import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import { authorize } from '@/common/middlewares/authorize';
import {
  getDashboardHandler,
  getJobMetricsHandler,
  getUserMetricsHandler,
  getApplicationMetricsHandler,
  getBehaviorMetricsHandler,
  approveJobHandler,
  rejectJobHandler,
  getPendingJobsHandler,
  approveCompanyHandler,
  rejectCompanyHandler,
  getPendingCompaniesHandler,
  listUsersHandler,
  updateUserStatusHandler,
  updateUserRoleHandler,
  listAllJobsHandler,
  deleteJobHandler,
} from './admin.controller';
import {
  exportJobsJSONHandler,
  exportJobsXMLHandler,
  importJobsJSONHandler,
  importJobsXMLHandler,
  scrapeJobsHandler,
} from './job-feed.controller';
import {
  approveJobSchema,
  rejectJobSchema,
  approveCompanySchema,
  rejectCompanySchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  adminQuerySchema,
} from './admin.validation';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard & Analytics
router
  .route('/dashboard')
  .get(asyncHandler(getDashboardHandler));

router
  .route('/analytics/jobs')
  .get(asyncHandler(getJobMetricsHandler));

router
  .route('/analytics/users')
  .get(asyncHandler(getUserMetricsHandler));

router
  .route('/analytics/applications')
  .get(asyncHandler(getApplicationMetricsHandler));

router
  .route('/analytics/behavior')
  .get(validateRequest(adminQuerySchema), asyncHandler(getBehaviorMetricsHandler));

// Job Approval Management
router
  .route('/jobs/pending')
  .get(validateRequest(adminQuerySchema), asyncHandler(getPendingJobsHandler));

router
  .route('/jobs')
  .get(validateRequest(adminQuerySchema), asyncHandler(listAllJobsHandler));

router
  .route('/jobs/:id/approve')
  .post(validateRequest(approveJobSchema), asyncHandler(approveJobHandler));

router
  .route('/jobs/:id/reject')
  .post(validateRequest(rejectJobSchema), asyncHandler(rejectJobHandler));

router
  .route('/jobs/:id')
  .delete(asyncHandler(deleteJobHandler));

// Company Approval Management
router
  .route('/companies/pending')
  .get(validateRequest(adminQuerySchema), asyncHandler(getPendingCompaniesHandler));

router
  .route('/companies/:id/approve')
  .post(validateRequest(approveCompanySchema), asyncHandler(approveCompanyHandler));

router
  .route('/companies/:id/reject')
  .post(validateRequest(rejectCompanySchema), asyncHandler(rejectCompanyHandler));

// User Management
router
  .route('/users')
  .get(validateRequest(adminQuerySchema), asyncHandler(listUsersHandler));

router
  .route('/users/:id/status')
  .patch(validateRequest(updateUserStatusSchema), asyncHandler(updateUserStatusHandler));

router
  .route('/users/:id/role')
  .patch(validateRequest(updateUserRoleSchema), asyncHandler(updateUserRoleHandler));

// Job Feed Import/Export
router
  .route('/jobs/export/json')
  .get(asyncHandler(exportJobsJSONHandler));

router
  .route('/jobs/export/xml')
  .get(asyncHandler(exportJobsXMLHandler));

router
  .route('/jobs/import/json')
  .post(asyncHandler(importJobsJSONHandler));

router
  .route('/jobs/import/xml')
  .post(asyncHandler(importJobsXMLHandler));

// Job Scraping
router
  .route('/jobs/scrape')
  .post(asyncHandler(scrapeJobsHandler));

export const adminRouter = router;

