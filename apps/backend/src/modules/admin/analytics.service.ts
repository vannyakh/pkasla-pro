import { JobModel } from '@/modules/jobs/job.model';
import { UserModel } from '@/modules/users/user.model';
import { ApplicationModel } from '@/modules/applications/application.model';
import { BlogModel } from '@/modules/blog/blog.model';

export interface SiteMetrics {
  totalJobs: number;
  publishedJobs: number;
  pendingJobApprovals: number;
  totalUsers: number;
  activeUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  pendingCompanyApprovals: number;
  totalApplications: number;
  applicationRate: number; // Applications per job
  activeUsersCount: number;
  totalBlogs: number;
  publishedBlogs: number;
}

export interface JobMetrics {
  total: number;
  published: number;
  draft: number;
  archived: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  byEmploymentType: Record<string, number>;
  byLocation: Array<{ location: string; count: number }>;
}

export interface UserMetrics {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  byRole: Record<string, number>;
  companyApprovals: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface ApplicationMetrics {
  total: number;
  byStatus: Record<string, number>;
  applicationRate: number;
  averageApplicationsPerJob: number;
}

class AnalyticsService {
  async getSiteMetrics(): Promise<SiteMetrics> {
    const [
      totalJobs,
      publishedJobs,
      pendingJobApprovals,
      totalUsers,
      activeUsers,
      totalCandidates,
      totalRecruiters,
      pendingCompanyApprovals,
      totalApplications,
      totalBlogs,
      publishedBlogs,
    ] = await Promise.all([
      JobModel.countDocuments(),
      JobModel.countDocuments({ status: 'published', approvalStatus: 'approved' }),
      JobModel.countDocuments({ approvalStatus: 'pending' }),
      UserModel.countDocuments(),
      UserModel.countDocuments({ status: 'active' }),
      UserModel.countDocuments({ role: 'candidate' }),
      UserModel.countDocuments({ role: 'recruiter' }),
      UserModel.countDocuments({ role: 'recruiter', companyApprovalStatus: 'pending' }),
      ApplicationModel.countDocuments(),
      BlogModel.countDocuments(),
      BlogModel.countDocuments({ status: 'published' }),
    ]);

    const applicationRate = publishedJobs > 0 ? totalApplications / publishedJobs : 0;

    return {
      totalJobs,
      publishedJobs,
      pendingJobApprovals,
      totalUsers,
      activeUsers,
      totalCandidates,
      totalRecruiters,
      pendingCompanyApprovals,
      totalApplications,
      applicationRate: Math.round(applicationRate * 100) / 100,
      activeUsersCount: activeUsers,
      totalBlogs,
      publishedBlogs,
    };
  }

  async getJobMetrics(): Promise<JobMetrics> {
    const [
      total,
      published,
      draft,
      archived,
      pendingApproval,
      approved,
      rejected,
      byEmploymentType,
      byLocation,
    ] = await Promise.all([
      JobModel.countDocuments(),
      JobModel.countDocuments({ status: 'published' }),
      JobModel.countDocuments({ status: 'draft' }),
      JobModel.countDocuments({ status: 'archived' }),
      JobModel.countDocuments({ approvalStatus: 'pending' }),
      JobModel.countDocuments({ approvalStatus: 'approved' }),
      JobModel.countDocuments({ approvalStatus: 'rejected' }),
      JobModel.aggregate([
        {
          $group: {
            _id: '$employmentType',
            count: { $sum: 1 },
          },
        },
      ]),
      JobModel.aggregate([
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const employmentTypeMap: Record<string, number> = {};
    byEmploymentType.forEach((item: any) => {
      employmentTypeMap[item._id] = item.count;
    });

    return {
      total,
      published,
      draft,
      archived,
      pendingApproval,
      approved,
      rejected,
      byEmploymentType: employmentTypeMap,
      byLocation: byLocation.map((item: any) => ({
        location: item._id,
        count: item.count,
      })),
    };
  }

  async getUserMetrics(): Promise<UserMetrics> {
    const [
      total,
      active,
      pending,
      suspended,
      byRole,
      companyApprovals,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ status: 'active' }),
      UserModel.countDocuments({ status: 'pending' }),
      UserModel.countDocuments({ status: 'suspended' }),
      UserModel.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]),
      UserModel.aggregate([
        {
          $match: { role: 'recruiter' },
        },
        {
          $group: {
            _id: '$companyApprovalStatus',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const roleMap: Record<string, number> = {};
    byRole.forEach((item: any) => {
      roleMap[item._id] = item.count;
    });

    const approvalMap: Record<string, number> = {};
    companyApprovals.forEach((item: any) => {
      approvalMap[item._id || 'pending'] = item.count;
    });

    return {
      total,
      active,
      pending,
      suspended,
      byRole: roleMap,
      companyApprovals: {
        pending: approvalMap.pending || 0,
        approved: approvalMap.approved || 0,
        rejected: approvalMap.rejected || 0,
      },
    };
  }

  async getApplicationMetrics(): Promise<ApplicationMetrics> {
    const [
      total,
      byStatus,
      publishedJobsCount,
    ] = await Promise.all([
      ApplicationModel.countDocuments(),
      ApplicationModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      JobModel.countDocuments({ status: 'published', approvalStatus: 'approved' }),
    ]);

    const statusMap: Record<string, number> = {};
    byStatus.forEach((item: any) => {
      statusMap[item._id] = item.count;
    });

    const averageApplicationsPerJob = publishedJobsCount > 0 ? total / publishedJobsCount : 0;

    return {
      total,
      byStatus: statusMap,
      applicationRate: publishedJobsCount > 0 ? (total / publishedJobsCount) * 100 : 0,
      averageApplicationsPerJob: Math.round(averageApplicationsPerJob * 100) / 100,
    };
  }

  async getBehaviorMetrics(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = startDate;
      if (endDate) dateFilter.createdAt.$lte = endDate;
    }

    const [
      jobViews,
      applicationSubmissions,
      jobSaves,
      userRegistrations,
      blogViews,
    ] = await Promise.all([
      // Job views would need to be tracked separately - placeholder
      Promise.resolve(0),
      ApplicationModel.countDocuments(dateFilter),
      // Job saves would need to be tracked - placeholder
      Promise.resolve(0),
      UserModel.countDocuments(dateFilter),
      BlogModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, totalViews: { $sum: '$views' } } },
      ]),
    ]);

    return {
      jobViews,
      applicationSubmissions,
      jobSaves,
      userRegistrations,
      blogViews: blogViews[0]?.totalViews || 0,
    };
  }
}

export const analyticsService = new AnalyticsService();

