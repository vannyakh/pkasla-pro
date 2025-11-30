import type { FilterQuery } from 'mongoose';
import { AuditLogModel, type AuditLogDocument } from './audit-log.model';

export class AuditLogRepository {
  create(payload: Partial<AuditLogDocument>) {
    return AuditLogModel.create(payload);
  }

  findById(id: string) {
    return AuditLogModel.findById(id).lean();
  }

  list(filter: FilterQuery<AuditLogDocument> = {}) {
    return AuditLogModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  listPaginated(
    filter: FilterQuery<AuditLogDocument> = {},
    page: number = 1,
    pageSize: number = 10,
    sort?: Record<string, 1 | -1>,
  ) {
    const skip = (page - 1) * pageSize;
    const defaultSort = { createdAt: -1 };
    const query = AuditLogModel.find(filter);
    
    if (sort) {
      query.sort(sort);
    } else {
      query.sort(defaultSort);
    }
    
    return query.skip(skip).limit(pageSize).lean();
  }

  countDocuments(filter: FilterQuery<AuditLogDocument> = {}) {
    return AuditLogModel.countDocuments(filter);
  }

  findByUserId(userId: string, limit: number = 50) {
    return AuditLogModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  findByResource(resource: string, resourceId: string, limit: number = 50) {
    return AuditLogModel.find({ resource, resourceId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

export const auditLogRepository = new AuditLogRepository();

