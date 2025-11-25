import httpStatus from 'http-status';
import { AppError } from '@/common/errors/app-error';
import { jobRepository } from '@/modules/jobs/job.repository';
import { userRepository } from '@/modules/users/user.repository';
import type { JobDocument } from '@/modules/jobs/job.model';
import type { UserDocument } from '@/modules/users/user.model';

class AdminService {
  // Job Approval Management
  async approveJob(jobId: string, adminId: string) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', httpStatus.NOT_FOUND);
    }

    const updateData: any = {
      approvalStatus: 'approved',
      approvedBy: adminId as any,
      approvedAt: new Date(),
    };

    // Auto-publish if it was in draft
    if (job.status === 'draft') {
      updateData.status = 'published';
    }

    return jobRepository.updateById(jobId, updateData);
  }

  async rejectJob(jobId: string, adminId: string, reason?: string) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', httpStatus.NOT_FOUND);
    }

    return jobRepository.updateById(jobId, {
      approvalStatus: 'rejected',
      approvedBy: adminId as any,
      approvedAt: new Date(),
      rejectionReason: reason,
    });
  }

  async getPendingJobs(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const filter = { approvalStatus: 'pending' };
    const [jobs, total] = await Promise.all([
      jobRepository.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      jobRepository.countDocuments(filter),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  // Company/User Approval Management
  async approveCompany(userId: string, adminId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    if (user.role !== 'recruiter') {
      throw new AppError('User is not a recruiter', httpStatus.BAD_REQUEST);
    }

    return userRepository.updateById(userId, {
      companyApprovalStatus: 'approved',
      approvedBy: adminId as any,
      approvedAt: new Date(),
      status: 'active', // Activate the user
    });
  }

  async rejectCompany(userId: string, adminId: string, reason?: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    if (user.role !== 'recruiter') {
      throw new AppError('User is not a recruiter', httpStatus.BAD_REQUEST);
    }

    return userRepository.updateById(userId, {
      companyApprovalStatus: 'rejected',
      approvedBy: adminId as any,
      approvedAt: new Date(),
      rejectionReason: reason,
      status: 'suspended', // Suspend the user
    });
  }

  async getPendingCompanies(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const filter = {
      role: 'recruiter',
      companyApprovalStatus: 'pending',
    };
    const [users, total] = await Promise.all([
      userRepository.list(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      userRepository.countDocuments(filter),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  // User Management
  async updateUserStatus(userId: string, status: 'active' | 'pending' | 'suspended') {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    return userRepository.updateById(userId, { status });
  }

  async updateUserRole(userId: string, role: 'admin' | 'recruiter' | 'candidate') {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    return userRepository.updateById(userId, { role });
  }

  async listUsers(page: number = 1, limit: number = 20, filters?: {
    role?: string;
    status?: string;
    search?: string;
  }) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters?.role) {
      query.role = filters.role;
    }
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      userRepository.list(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      userRepository.countDocuments(query),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  // Job Management
  async listAllJobs(page: number = 1, limit: number = 20, filters?: {
    status?: string;
    approvalStatus?: string;
    search?: string;
  }) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.approvalStatus) {
      query.approvalStatus = filters.approvalStatus;
    }
    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { company: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      jobRepository.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      jobRepository.countDocuments(query),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async deleteJob(jobId: string) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', httpStatus.NOT_FOUND);
    }

    return jobRepository.deleteById(jobId);
  }
}

export const adminService = new AdminService();

