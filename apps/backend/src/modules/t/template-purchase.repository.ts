import type { FilterQuery } from 'mongoose';
import { TemplatePurchaseModel, type TemplatePurchaseDocument } from './template-purchase.model';

export class TemplatePurchaseRepository {
  create(payload: Partial<TemplatePurchaseDocument>) {
    return TemplatePurchaseModel.create(payload);
  }

  findById(id: string) {
    return TemplatePurchaseModel.findById(id)
      .populate('userId', 'name email')
      .populate('templateId')
      .lean();
  }

  findByUserId(userId: string) {
    return TemplatePurchaseModel.find({ userId })
      .populate('templateId')
      .sort({ purchaseDate: -1 })
      .lean();
  }

  findByTemplateId(templateId: string) {
    return TemplatePurchaseModel.find({ templateId })
      .populate('userId', 'name email')
      .sort({ purchaseDate: -1 })
      .lean();
  }

  findByUserAndTemplate(userId: string, templateId: string) {
    return TemplatePurchaseModel.findOne({ userId, templateId })
      .populate('templateId')
      .lean();
  }

  hasUserPurchasedTemplate(userId: string, templateId: string): Promise<boolean> {
    return TemplatePurchaseModel.exists({ userId, templateId }).then((result) => !!result);
  }

  list(filter: FilterQuery<TemplatePurchaseDocument> = {}) {
    return TemplatePurchaseModel.find(filter)
      .populate('userId', 'name email')
      .populate('templateId', 'name title previewImage')
      .sort({ purchaseDate: -1 })
      .lean();
  }

  countDocuments(filter: FilterQuery<TemplatePurchaseDocument> = {}) {
    return TemplatePurchaseModel.countDocuments(filter);
  }

  // Get total revenue
  getTotalRevenue(filter: FilterQuery<TemplatePurchaseDocument> = {}) {
    return TemplatePurchaseModel.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);
  }
}

export const templatePurchaseRepository = new TemplatePurchaseRepository();

