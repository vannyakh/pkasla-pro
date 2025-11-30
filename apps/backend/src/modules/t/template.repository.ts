import type { FilterQuery, UpdateQuery } from 'mongoose';
import { TemplateModel, type TemplateDocument } from './template.model';

export class TemplateRepository {
  create(payload: Partial<TemplateDocument>) {
    return TemplateModel.create(payload);
  }

  findById(id: string) {
    return TemplateModel.findById(id).lean();
  }

  findByName(name: string) {
    return TemplateModel.findOne({ name }).lean();
  }

  findBySlug(slug: string) {
    return TemplateModel.findOne({ slug }).lean();
  }

  updateById(id: string, payload: UpdateQuery<TemplateDocument>) {
    return TemplateModel.findByIdAndUpdate(id, payload, { new: true }).lean();
  }

  deleteById(id: string) {
    return TemplateModel.findByIdAndDelete(id);
  }

  list(filter: FilterQuery<TemplateDocument> = {}) {
    return TemplateModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  listPaginated(
    filter: FilterQuery<TemplateDocument> = {},
    page: number = 1,
    pageSize: number = 10,
    sort?: Record<string, 1 | -1>
  ) {
    const skip = (page - 1) * pageSize;
    const query = TemplateModel.find(filter);
    if (sort) {
      query.sort(sort);
    }
    return query
      .skip(skip)
      .limit(pageSize)
      .lean();
  }

  countDocuments(filter: FilterQuery<TemplateDocument> = {}) {
    return TemplateModel.countDocuments(filter);
  }
}

export const templateRepository = new TemplateRepository();

