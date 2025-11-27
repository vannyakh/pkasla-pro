import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { subscriptionPlanService } from './subscription-plan.service';
import { buildSuccessResponse } from '@/helpers/http-response';

/**
 * Create a new subscription plan (Admin only)
 */
export const createSubscriptionPlanHandler = async (req: Request, res: Response) => {
  const plan = await subscriptionPlanService.create(req.body);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(plan, 'Subscription plan created successfully'));
};

/**
 * Get subscription plan by ID
 */
export const getSubscriptionPlanHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const plan = await subscriptionPlanService.findByIdOrFail(id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(plan));
};

/**
 * Update subscription plan by ID (Admin only)
 */
export const updateSubscriptionPlanHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const plan = await subscriptionPlanService.updateById(id, req.body);
  return res.status(httpStatus.OK).json(buildSuccessResponse(plan, 'Subscription plan updated successfully'));
};

/**
 * Delete subscription plan by ID (Admin only)
 */
export const deleteSubscriptionPlanHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  await subscriptionPlanService.deleteById(id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(null, 'Subscription plan deleted successfully'));
};

/**
 * List all subscription plans
 */
export const listSubscriptionPlansHandler = async (req: Request, res: Response) => {
  const activeOnly = req.query.activeOnly === 'true';
  const plans = await subscriptionPlanService.list(activeOnly);
  return res.status(httpStatus.OK).json(buildSuccessResponse(plans));
};

