import { Router } from 'express';
import { validateRequest } from '@/common/middlewares/validate-request';
import {
  getSettingsHandler,
  updateSettingsHandler,
  getSystemInfoHandler,
  testTelegramHandler,
} from './settings.controller';
import {
  updateSettingsSchema,
  getSettingsSchema,
  testTelegramSchema,
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

// Test Telegram bot connection
router
  .route('/test-telegram')
  .post(validateRequest(testTelegramSchema), testTelegramHandler);

export const settingsRouter: Router = router;

