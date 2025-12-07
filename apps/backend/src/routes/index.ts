import { Router } from 'express';
import { authRouter } from '@/modules/auth';
import { userRouter } from '@/modules/users';
import { uploadRouter } from '@/modules/upload';
import { adminRouter } from '@/modules/admin';
import { templateRouter } from '@/modules/t/template.router';
import { eventRouter } from '@/modules/events';
import { guestRouter } from '@/modules/guests';
import { agendaRouter } from '@/modules/agenda';
import { invitationRouter } from '@/modules/invitations';
import { subscriptionPlanRouter, userSubscriptionRouter } from '@/modules/subscriptions';
import { templatePurchaseRouter } from '@/modules/t/template-purchase.router';
import { paymentRouter } from '@/modules/payments/payment.router';
import { revenueRouter } from '@/modules/analytics/revenue.router';
import { inviteRouter } from '@/modules/invites';
import { auditLogRouter } from '@/modules/audit-logs';
const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/upload', uploadRouter);
router.use('/admin', adminRouter);
router.use('/templates', templateRouter);
router.use('/events', eventRouter);
router.use('/guests', guestRouter);
router.use('/agenda', agendaRouter);
router.use('/invitations', invitationRouter);
router.use('/subscription-plans', subscriptionPlanRouter);
router.use('/subscriptions', userSubscriptionRouter);
router.use('/template-purchases', templatePurchaseRouter);
router.use('/payments', paymentRouter);
router.use('/analytics/revenue', revenueRouter);
router.use('/invites', inviteRouter);
router.use('/audit-logs', auditLogRouter);

export const apiRouter: Router = router;

