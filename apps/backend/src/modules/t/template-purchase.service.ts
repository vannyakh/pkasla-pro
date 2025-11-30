import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '@/common/errors/app-error';
import { templatePurchaseRepository } from './template-purchase.repository';
import { templateRepository } from './template.repository';
import type { TemplatePurchaseDocument } from './template-purchase.model';
import { revenueService } from '@/modules/analytics/revenue.service';

export interface CreateTemplatePurchaseInput {
  userId: string;
  templateId: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface TemplatePurchaseResponse {
  id: string;
  userId: string;
  templateId: string | any;
  price: number;
  purchaseDate: Date;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

type TemplatePurchaseSource = TemplatePurchaseDocument | (Record<string, any> & { _id?: unknown }) | null;

export const sanitizeTemplatePurchase = (
  purchase: TemplatePurchaseSource
): TemplatePurchaseResponse | null => {
  if (!purchase) {
    return null;
  }
  const purchaseObj =
    typeof (purchase as TemplatePurchaseDocument).toObject === 'function'
      ? (purchase as TemplatePurchaseDocument).toObject()
      : purchase;
  const { _id, __v, ...rest } = purchaseObj as Record<string, any>;
  return {
    ...(rest as Omit<TemplatePurchaseResponse, 'id'>),
    id: (_id ?? (rest as Record<string, any>).id).toString(),
  } as TemplatePurchaseResponse;
};

class TemplatePurchaseService {
  async create(payload: CreateTemplatePurchaseInput): Promise<TemplatePurchaseResponse> {
    // Verify template exists
    const template = await templateRepository.findById(payload.templateId);
    if (!template) {
      throw new AppError('Template not found', httpStatus.NOT_FOUND);
    }

    // Check if user already purchased this template
    const existingPurchase = await templatePurchaseRepository.hasUserPurchasedTemplate(
      payload.userId,
      payload.templateId
    );
    if (existingPurchase) {
      throw new AppError('You have already purchased this template', httpStatus.CONFLICT);
    }

    // Get template price (default to 0 if free)
    const price = (template as any).price || 0;

    const purchase = await templatePurchaseRepository.create({
      userId: new Types.ObjectId(payload.userId),
      templateId: new Types.ObjectId(payload.templateId),
      price,
      purchaseDate: new Date(),
      paymentMethod: payload.paymentMethod,
      transactionId: payload.transactionId,
    });

    const safePurchase = sanitizeTemplatePurchase(purchase);
    if (!safePurchase) {
      throw new AppError('Unable to create purchase', httpStatus.INTERNAL_SERVER_ERROR);
    }

    // Invalidate revenue cache when a purchase is made
    await revenueService.invalidateCache();

    return safePurchase;
  }

  async findById(id: string): Promise<TemplatePurchaseResponse | null> {
    const purchase = await templatePurchaseRepository.findById(id);
    return sanitizeTemplatePurchase(purchase as unknown as TemplatePurchaseDocument);
  }

  async findByUserId(userId: string): Promise<TemplatePurchaseResponse[]> {
    const purchases = await templatePurchaseRepository.findByUserId(userId);
    return purchases
      .map((purchase) => sanitizeTemplatePurchase(purchase as unknown as TemplatePurchaseDocument))
      .filter(Boolean) as TemplatePurchaseResponse[];
  }

  async hasUserPurchasedTemplate(userId: string, templateId: string): Promise<boolean> {
    return templatePurchaseRepository.hasUserPurchasedTemplate(userId, templateId);
  }

  async getTotalRevenue(): Promise<number> {
    const result = await templatePurchaseRepository.getTotalRevenue();
    return result.length > 0 && result[0].total ? result[0].total : 0;
  }

  async list(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      userId?: string;
      templateId?: string;
      search?: string;
    }
  ): Promise<{
    items: TemplatePurchaseResponse[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const filter: any = {};
    
    if (filters?.userId) {
      filter.userId = new Types.ObjectId(filters.userId);
    }
    
    if (filters?.templateId) {
      filter.templateId = new Types.ObjectId(filters.templateId);
    }

    const skip = (page - 1) * pageSize;
    const query = templatePurchaseRepository.list(filter);
    const purchasesQuery = query.skip(skip).limit(pageSize);
    const [purchases, total] = await Promise.all([
      purchasesQuery,
      templatePurchaseRepository.countDocuments(filter),
    ]);

    let sanitized = purchases
      .map((purchase) => sanitizeTemplatePurchase(purchase as unknown as TemplatePurchaseDocument))
      .filter(Boolean) as TemplatePurchaseResponse[];

    // If search filter, filter by user name or template name
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      sanitized = sanitized.filter((purchase) => {
        const userName = (purchase.userId as any)?.name?.toLowerCase() || '';
        const userEmail = (purchase.userId as any)?.email?.toLowerCase() || '';
        const templateName = (purchase.templateId as any)?.name?.toLowerCase() || '';
        const templateTitle = (purchase.templateId as any)?.title?.toLowerCase() || '';
        return userName.includes(searchLower) || 
               userEmail.includes(searchLower) || 
               templateName.includes(searchLower) || 
               templateTitle.includes(searchLower);
      });
    }

    return {
      items: sanitized,
      total: filters?.search ? sanitized.length : total,
      page,
      pageSize,
    };
  }
}

export const templatePurchaseService = new TemplatePurchaseService();

