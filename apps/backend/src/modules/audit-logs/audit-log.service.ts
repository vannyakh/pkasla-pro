import httpStatus from 'http-status';
import { AppError } from '@/common/errors/app-error';
import { auditLogRepository } from './audit-log.repository';
import type { AuditLogDocument, AuditLogAction, AuditLogStatus } from './audit-log.model';
import { buildSuccessResponse } from '@/helpers/http-response';

export interface CreateAuditLogInput {
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: AuditLogAction;
  resource: string;
  resourceId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditLogStatus;
  metadata?: Record<string, any>;
}

export interface AuditLogResponse {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: AuditLogAction;
  resource: string;
  resourceId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  status: AuditLogStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogFilters {
  userId?: string;
  userEmail?: string;
  action?: AuditLogAction;
  resource?: string;
  resourceId?: string;
  status?: AuditLogStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

const sanitizeAuditLog = (log: AuditLogDocument | Record<string, any> | null): AuditLogResponse | null => {
  if (!log) {
    return null;
  }
  
  const logObj = typeof (log as AuditLogDocument).toObject === 'function'
    ? (log as AuditLogDocument).toObject()
    : log;
  
  const { _id, __v, ...rest } = logObj as Record<string, any>;
  
  return {
    ...(rest as Omit<AuditLogResponse, 'id'>),
    id: (_id ?? (rest as Record<string, any>).id).toString(),
  } as AuditLogResponse;
};

class AuditLogService {
  async create(payload: CreateAuditLogInput) {
    const log = await auditLogRepository.create(payload);
    return sanitizeAuditLog(log as unknown as AuditLogDocument);
  }

  async findById(id: string) {
    const log = await auditLogRepository.findById(id);
    return sanitizeAuditLog(log as unknown as AuditLogDocument);
  }

  async findByIdOrFail(id: string) {
    const log = await this.findById(id);
    if (!log) {
      throw new AppError('Audit log not found', httpStatus.NOT_FOUND);
    }
    return log;
  }

  async list(filters: AuditLogFilters = {}, page: number = 1, pageSize: number = 10) {
    const query: any = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.userEmail) {
      query.userEmail = { $regex: filters.userEmail, $options: 'i' };
    }

    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.resource) {
      query.resource = filters.resource;
    }

    if (filters.resourceId) {
      query.resourceId = filters.resourceId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    if (filters.search) {
      query.$or = [
        { description: { $regex: filters.search, $options: 'i' } },
        { userEmail: { $regex: filters.search, $options: 'i' } },
        { userName: { $regex: filters.search, $options: 'i' } },
        { resource: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [logs, total] = await Promise.all([
      auditLogRepository.listPaginated(query, page, pageSize),
      auditLogRepository.countDocuments(query),
    ]);

    const sanitizedLogs = logs
      .map((log) => sanitizeAuditLog(log as unknown as AuditLogDocument))
      .filter(Boolean) as AuditLogResponse[];

    return buildSuccessResponse(
      {
        items: sanitizedLogs,
        total,
        page,
        pageSize,
      },
      'Audit logs fetched successfully',
    );
  }

  async findByUserId(userId: string, limit: number = 50) {
    const logs = await auditLogRepository.findByUserId(userId, limit);
    return logs
      .map((log) => sanitizeAuditLog(log as unknown as AuditLogDocument))
      .filter(Boolean) as AuditLogResponse[];
  }

  async findByResource(resource: string, resourceId: string, limit: number = 50) {
    const logs = await auditLogRepository.findByResource(resource, resourceId, limit);
    return logs
      .map((log) => sanitizeAuditLog(log as unknown as AuditLogDocument))
      .filter(Boolean) as AuditLogResponse[];
  }
}

export const auditLogService = new AuditLogService();

