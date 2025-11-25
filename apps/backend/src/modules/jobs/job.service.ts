import httpStatus from 'http-status';
import type { z } from 'zod';
import { Types } from 'mongoose';
import { AppError } from '@/common/errors/app-error';
import { jobRepository } from './job.repository';
import { jobFinderService, type JobFinderQuery } from './job.finder';
import { createJobSchema, updateJobSchema } from './job.validation';
import { savedJobRepository } from './saved-job.repository';

export type CreateJobInput = z.infer<typeof createJobSchema>['body'];
export type UpdateJobInput = z.infer<typeof updateJobSchema>['body'];

class JobService {
  async create(payload: CreateJobInput, postedBy?: string) {
    const jobData: any = {
      ...payload,
      approvalStatus: 'pending', // Jobs require approval
    };
    
    if (postedBy) {
      jobData.postedBy = postedBy as any;
    }
    
    const job = await jobRepository.create(jobData);
    // Invalidate cache when a new job is created
    await jobFinderService.invalidateCache().catch(() => {
      // Ignore cache errors
    });
    return job;
  }

  async findById(id: string) {
    const job = await jobRepository.findById(id);
    if (!job) {
      throw new AppError('Job not found', httpStatus.NOT_FOUND);
    }
    return job;
  }

  async update(id: string, payload: UpdateJobInput) {
    const job = await jobRepository.updateById(id, payload);
    if (!job) {
      throw new AppError('Job not found', httpStatus.NOT_FOUND);
    }
    // Invalidate cache when a job is updated
    await jobFinderService.invalidateCache().catch(() => {
      // Ignore cache errors
    });
    return job;
  }

  async remove(id: string) {
    const job = await jobRepository.deleteById(id);
    if (!job) {
      throw new AppError('Job not found', httpStatus.NOT_FOUND);
    }
    // Invalidate cache when a job is deleted
    await jobFinderService.invalidateCache().catch(() => {
      // Ignore cache errors
    });
    return job;
  }

  list(query: JobFinderQuery) {
    return jobFinderService.execute(query);
  }

  async saveJob(userId: string, jobId: string) {
    // Check if job exists
    const job = await this.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', httpStatus.NOT_FOUND);
    }

    // Check if already saved
    const existing = await savedJobRepository.findByUserAndJob(userId, jobId);
    if (existing) {
      throw new AppError('Job already saved', httpStatus.CONFLICT);
    }

    return savedJobRepository.create({ userId, jobId });
  }

  async unsaveJob(userId: string, jobId: string) {
    const savedJob = await savedJobRepository.deleteByUserAndJob(userId, jobId);
    if (!savedJob) {
      throw new AppError('Saved job not found', httpStatus.NOT_FOUND);
    }
    return savedJob;
  }

  async getSavedJobs(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [savedJobs, total] = await Promise.all([
      savedJobRepository.findByUser(userId, { limit, skip }),
      savedJobRepository.countByUser(userId),
    ]);

    // Get the actual job details
    const jobIds = savedJobs.map((sj) => sj.jobId).filter(Boolean);
    const objectIds = jobIds.map((id) => new Types.ObjectId(id));
    const jobs = await jobRepository.find({ _id: { $in: objectIds } });

    // Maintain the order from savedJobs
    const jobsMap = new Map(jobs.map((job) => [job.id, job]));
    const orderedJobs = savedJobs
      .map((sj) => jobsMap.get(sj.jobId))
      .filter((job) => job !== undefined);

    return {
      data: orderedJobs,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    const savedJob = await savedJobRepository.findByUserAndJob(userId, jobId);
    return !!savedJob;
  }
}

export const jobService = new JobService();

