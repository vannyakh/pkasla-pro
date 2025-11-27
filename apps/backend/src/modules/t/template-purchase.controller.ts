import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { templatePurchaseService } from './template-purchase.service';
import { buildSuccessResponse } from '@/helpers/http-response';

/**
 * Purchase a template
 */
export const createTemplatePurchaseHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const purchase = await templatePurchaseService.create({
    userId: req.user.id,
    ...req.body,
  });
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(purchase, 'Template purchased successfully'));
};

/**
 * Get current user's template purchases
 */
export const getMyTemplatePurchasesHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const purchases = await templatePurchaseService.findByUserId(req.user.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(purchases));
};

/**
 * Check if user owns a template
 */
export const checkTemplateOwnershipHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  const { templateId } = req.params;
  const hasPurchased = await templatePurchaseService.hasUserPurchasedTemplate(req.user.id, templateId);
  return res.status(httpStatus.OK).json(buildSuccessResponse({ ownsTemplate: hasPurchased }));
};

/**
 * Get total revenue from template purchases (Admin only)
 */
export const getTemplateRevenueHandler = async (req: Request, res: Response) => {
  const totalRevenue = await templatePurchaseService.getTotalRevenue();
  return res.status(httpStatus.OK).json(buildSuccessResponse({ totalRevenue }));
};

