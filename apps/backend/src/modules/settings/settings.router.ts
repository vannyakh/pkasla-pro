import { Router } from 'express';
import { validateRequest } from '@/common/middlewares/validate-request';
import {
  getSettingsHandler,
  updateSettingsHandler,
  getSystemInfoHandler,
} from './settings.controller';
import {
  updateSettingsSchema,
  getSettingsSchema,
} from './settings.validation';

const router = Router();

// Note: Authentication and authorization are handled by the parent admin router

// Get settings
router
  .route('/')
  .get(validateRequest(getSettingsSchema), getSettingsHandler)
  .put(validateRequest(updateSettingsSchema), updateSettingsHandler)
  .patch(validateRequest(updateSettingsSchema), updateSettingsHandler);

// Get system information
router
  .route('/system-info')
  .get(getSystemInfoHandler);

export const settingsRouter: Router = router;

