import type { FilterQuery, UpdateQuery } from 'mongoose';
import { UploadModel, type UploadDocument } from './upload.model';

export class UploadRepository {
  create(payload: Partial<UploadDocument>) {
    return UploadModel.create(payload);
  }

  findById(id: string) {
    return UploadModel.findById(id).lean();
  }

  findByKey(key: string) {
    return UploadModel.findOne({ key }).lean();
  }

  findByUserId(userId: string, filter: FilterQuery<UploadDocument> = {}) {
    return UploadModel.find({ userId, ...filter })
      .sort({ createdAt: -1 })
      .lean();
  }

  findByFolder(folder: string, filter: FilterQuery<UploadDocument> = {}) {
    return UploadModel.find({ folder, ...filter })
      .sort({ createdAt: -1 })
      .lean();
  }

  updateById(id: string, payload: UpdateQuery<UploadDocument>) {
    return UploadModel.findByIdAndUpdate(id, payload, { new: true }).lean();
  }

  deleteById(id: string) {
    return UploadModel.findByIdAndDelete(id);
  }

  deleteByKey(key: string) {
    return UploadModel.findOneAndDelete({ key });
  }

  list(filter: FilterQuery<UploadDocument> = {}) {
    return UploadModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  count(filter: FilterQuery<UploadDocument> = {}) {
    return UploadModel.countDocuments(filter);
  }
}

export const uploadRepository = new UploadRepository();

