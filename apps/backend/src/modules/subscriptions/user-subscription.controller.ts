import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { userSubscriptionService } from './user-subscription.service';
import { buildSuccessResponse } from '@/helpers/http-response';

/**
 * Create a new subscription for current user
 */
export const createUserSubscriptionHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const subscription = await userSubscriptionService.create({
    userId: req.user.id,
    ...req.body,
  });
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(subscription, 'Subscription created successfully'));
};

/**
 * Get current user's subscriptions
 */
export const getMySubscriptionsHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const subscriptions = await userSubscriptionService.findByUserId(req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(subscriptions));
};

/**
 * Get current user's active subscription
 */
export const getMyActiveSubscriptionHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const subscription = await userSubscriptionService.findActiveByUserId(req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(subscription));
};

/**
 * Cancel a subscription
 */
export const cancelSubscriptionHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  const subscription = await userSubscriptionService.cancelSubscription(id, req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(subscription, 'Subscription cancelled successfully'));
};

/**
 * Get subscriptions by user ID (Admin only)
 */
export const getUserSubscriptionsHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const subscriptions = await userSubscriptionService.findByUserId(userId);
  return res.status(httpStatus.OK).json(buildSuccessResponse(subscriptions));
};

