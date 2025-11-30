import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { auditLogService } from './audit-log.service';
import { buildSuccessResponse } from '@/helpers/http-response';

export const listAuditLogsHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  
  const filters = {
    userId: req.query.userId as string | undefined,
    userEmail: req.query.userEmail as string | undefined,
    action: req.query.action as any,
    resource: req.query.resource as string | undefined,
    resourceId: req.query.resourceId as string | undefined,
    status: req.query.status as any,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    search: req.query.search as string | undefined,
  };

  const result = await auditLogService.list(filters, page, pageSize);
  return res.status(httpStatus.OK).json(result);
};

export const getAuditLogHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const log = await auditLogService.findByIdOrFail(id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(log));
};

export const getUserAuditLogsHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const limit = Number(req.query.limit) || 50;
  const logs = await auditLogService.findByUserId(userId, limit);
  return res.status(httpStatus.OK).json(buildSuccessResponse(logs));
};

export const getResourceAuditLogsHandler = async (req: Request, res: Response) => {
  const { resource, resourceId } = req.params;
  const limit = Number(req.query.limit) || 50;
  const logs = await auditLogService.findByResource(resource, resourceId, limit);
  return res.status(httpStatus.OK).json(buildSuccessResponse(logs));
};

