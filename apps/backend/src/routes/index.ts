import { Router } from 'express';
import { authRouter } from '@/modules/auth';
import { userRouter } from '@/modules/users';
import { uploadRouter } from '@/modules/upload';
import { adminRouter } from '@/modules/admin';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/upload', uploadRouter);
router.use('/admin', adminRouter);

export const apiRouter: Router = router;

