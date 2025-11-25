import { Router } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import { validateRequest } from '@/common/middlewares/validate-request';
import { authenticate } from '@/common/middlewares/authenticate';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  verifyTwoFactorLoginSchema,
  verifyTwoFactorSetupSchema,
  disableTwoFactorSchema,
  providerLoginSchema,
} from './auth.validation';
import {
  loginHandler,
  refreshTokenHandler,
  registerHandler,
  logoutHandler,
  verifyTwoFactorLoginHandler,
  setupTwoFactorHandler,
  verifyTwoFactorSetupHandler,
  disableTwoFactorHandler,
  providerLoginHandler,
} from './auth.controller';

const router = Router();

router.post('/register', validateRequest(registerSchema), asyncHandler(registerHandler));
router.post('/login', validateRequest(loginSchema), asyncHandler(loginHandler));
router.post('/login/oauth', validateRequest(providerLoginSchema), asyncHandler(providerLoginHandler));
router.post('/logout', authenticate, asyncHandler(logoutHandler));
router.post('/refresh', validateRequest(refreshSchema), asyncHandler(refreshTokenHandler));

// 2FA routes
router.post(
  '/login/verify-2fa',
  validateRequest(verifyTwoFactorLoginSchema),
  asyncHandler(verifyTwoFactorLoginHandler),
);
router.post('/2fa/setup', authenticate, asyncHandler(setupTwoFactorHandler));
router.post(
  '/2fa/verify',
  authenticate,
  validateRequest(verifyTwoFactorSetupSchema),
  asyncHandler(verifyTwoFactorSetupHandler),
);
router.post(
  '/2fa/disable',
  authenticate,
  validateRequest(disableTwoFactorSchema),
  asyncHandler(disableTwoFactorHandler),
);

export const authRouter : Router = router;

