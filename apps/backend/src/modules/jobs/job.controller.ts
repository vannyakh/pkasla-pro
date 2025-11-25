import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { buildSuccessResponse } from '@/helpers/http-response';
import { jobService } from './job.service';

export const createJobHandler = async (req: Request, res: Response) => {
  const postedBy = req.user?.id;
  const job = await jobService.create(req.body, postedBy);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(job));
};

export const listJobsHandler = async (req: Request, res: Response) => {
  const { data, ...meta } = await jobService.list(req.query);
  // console.log("🚀 ~ listJobsHandler ~ data:", data)
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
};

export const getJobHandler = async (req: Request, res: Response) => {
  const job = await jobService.findById(req.params.id);
  return res.status(httpStatus.OK).json(buildSuccessResponse(job));
};

export const updateJobHandler = async (req: Request, res: Response) => {
  const job = await jobService.update(req.params.id, req.body);
  return res.status(httpStatus.OK).json(buildSuccessResponse(job));
};

export const deleteJobHandler = async (req: Request, res: Response) => {
  await jobService.remove(req.params.id);
  return res.status(httpStatus.NO_CONTENT).send();
};

export const saveJobHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Authentication required' });
  }
  const savedJob = await jobService.saveJob(req.user.id, req.params.id);
  return res.status(httpStatus.CREATED).json(buildSuccessResponse(savedJob));
};

export const unsaveJobHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Authentication required' });
  }
  await jobService.unsaveJob(req.user.id, req.params.id);
  return res.status(httpStatus.NO_CONTENT).send();
};

export const getSavedJobsHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Authentication required' });
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const { data, ...meta } = await jobService.getSavedJobs(req.user.id, page, limit);
  return res.status(httpStatus.OK).json(buildSuccessResponse(data, meta));
};

