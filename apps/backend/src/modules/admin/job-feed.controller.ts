import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { buildSuccessResponse } from '@/helpers/http-response';
import { asyncHandler } from '@/utils/async-handler';
import { AppError } from '@/common/errors/app-error';
import { jobFeedService } from './job-feed.service';
import { jobScraperService } from './job-scraper.service';

export const exportJobsJSONHandler = asyncHandler(async (req: Request, res: Response) => {
  const { status, approvalStatus, limit } = req.query;
  const jobs = await jobFeedService.exportToJSON({
    status: status as string,
    approvalStatus: approvalStatus as string,
    limit: limit ? Number(limit) : undefined,
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=jobs-export.json');
  return res.status(httpStatus.OK).json(buildSuccessResponse(jobs));
});

export const exportJobsXMLHandler = asyncHandler(async (req: Request, res: Response) => {
  const { status, approvalStatus, limit } = req.query;
  const xml = await jobFeedService.exportToXML({
    status: status as string,
    approvalStatus: approvalStatus as string,
    limit: limit ? Number(limit) : undefined,
  });

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', 'attachment; filename=jobs-export.xml');
  return res.status(httpStatus.OK).send(xml);
});

export const importJobsJSONHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  if (!Array.isArray(req.body)) {
    throw new AppError('Request body must be an array of jobs', httpStatus.BAD_REQUEST);
  }

  const result = await jobFeedService.importFromJSON(req.body, req.user.id);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(result));
});

export const importJobsXMLHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  if (!req.body || typeof req.body !== 'string') {
    throw new AppError('Request body must be XML string', httpStatus.BAD_REQUEST);
  }

  const result = await jobFeedService.importFromXML(req.body, req.user.id);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(result));
});

export const scrapeJobsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
  }

  const config = req.body;
  const validation = jobScraperService.validateConfig(config);
  
  if (!validation.valid) {
    throw new AppError(`Invalid scraping config: ${validation.errors.join(', ')}`, httpStatus.BAD_REQUEST);
  }

  const result = await jobScraperService.scrapeJobs(config, req.user.id);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(result));
});

