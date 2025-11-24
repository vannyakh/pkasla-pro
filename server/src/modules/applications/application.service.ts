import httpStatus from 'http-status';
import type { z } from 'zod';
import { AppError } from '@/common/errors/app-error';
import { applicationRepository } from './application.repository';
import { createApplicationSchema, updateApplicationSchema } from './application.validation';
import { jobService } from '@/modules/jobs/job.service';
import type { ApplicationStatus } from './application.model';

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>['body'];
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>['body'];

class ApplicationService {
  async create(payload: CreateApplicationInput, candidateId: string) {
    // Check if job exists and is published
    const job = await jobService.findById(payload.jobId);
    if (job.status !== 'published' || job.approvalStatus !== 'approved') {
      throw new AppError('Job is not available for applications', httpStatus.BAD_REQUEST);
    }

    // Check if already applied
    const existing = await applicationRepository.findByJobAndCandidate(payload.jobId, candidateId);
    if (existing) {
      throw new AppError('You have already applied for this job', httpStatus.CONFLICT);
    }

    return applicationRepository.create({
      ...payload,
      candidateId: candidateId as any,
      jobId: payload.jobId as any,
    });
  }

  async findById(id: string) {
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new AppError('Application not found', httpStatus.NOT_FOUND);
    }
    return application;
  }

  async update(id: string, payload: UpdateApplicationInput, userId?: string) {
    const application = await this.findById(id);

    // Check if user is the candidate or admin/recruiter
    if (userId) {
      const isCandidate = application.candidateId.toString() === userId;
      const isAdmin = false; // You can check user role here if needed
      
      if (!isCandidate && !isAdmin) {
        throw new AppError('You can only update your own applications', httpStatus.FORBIDDEN);
      }
    }

    const updated = await applicationRepository.updateById(id, payload);
    if (!updated) {
      throw new AppError('Application not found', httpStatus.NOT_FOUND);
    }
    return updated;
  }

  async remove(id: string, candidateId?: string) {
    const application = await this.findById(id);

    if (candidateId && application.candidateId.toString() !== candidateId) {
      throw new AppError('You can only delete your own applications', httpStatus.FORBIDDEN);
    }

    const deleted = await applicationRepository.deleteById(id);
    if (!deleted) {
      throw new AppError('Application not found', httpStatus.NOT_FOUND);
    }
    return deleted;
  }

  async findByJobId(jobId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      applicationRepository.findByJobId(jobId, {}, { limit, skip }),
      applicationRepository.count({ jobId }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async findByCandidateId(candidateId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      applicationRepository.findByCandidateId(candidateId, {}, { limit, skip }),
      applicationRepository.count({ candidateId }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async updateStatus(id: string, status: ApplicationStatus, reviewedBy?: string) {
    const updateData: any = { status };
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy as any;
      updateData.reviewedAt = new Date();
    }
    return this.update(id, updateData);
  }

  async getStats(jobId?: string) {
    const filter = jobId ? { jobId } : {};
    const stats = await applicationRepository.getApplicationStats(filter);
    
    const statsMap = new Map(stats.map((s: any) => [s._id, s.count]));
    return {
      pending: statsMap.get('pending') || 0,
      reviewing: statsMap.get('reviewing') || 0,
      shortlisted: statsMap.get('shortlisted') || 0,
      rejected: statsMap.get('rejected') || 0,
      accepted: statsMap.get('accepted') || 0,
      withdrawn: statsMap.get('withdrawn') || 0,
      total: Array.from(statsMap.values()).reduce((sum, count) => sum + count, 0),
    };
  }
}

export const applicationService = new ApplicationService();

