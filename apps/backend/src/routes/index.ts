import { Router } from 'express';
import { jobRouter } from '@/modules/jobs';
import { authRouter } from '@/modules/auth';
import { userRouter } from '@/modules/users';
import { uploadRouter } from '@/modules/upload';
import { feedbackRouter } from '@/modules/feedback';
import { blogRouter } from '@/modules/blog';
import { adminRouter } from '@/modules/admin';
import { applicationRouter } from '@/modules/applications';
import { privacyRouter } from '@/modules/privacy';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/jobs', jobRouter);
router.use('/upload', uploadRouter);
router.use('/feedbacks', feedbackRouter);
router.use('/blogs', blogRouter);
router.use('/applications', applicationRouter);
router.use('/admin', adminRouter);
router.use('/privacy', privacyRouter);

export const apiRouter: Router = router;

