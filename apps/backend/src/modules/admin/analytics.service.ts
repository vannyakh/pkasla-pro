import { UserModel } from '@/modules/users/user.model';

export interface SiteMetrics {
  totalUsers: number;
  activeUsers: number;
  activeUsersCount: number;
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
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ status: 'active' }),
      UserModel.countDocuments({ role: 'candidate' }),
      UserModel.countDocuments({ role: 'recruiter' }),
      UserModel.countDocuments({ role: 'recruiter', companyApprovalStatus: 'pending' }),
    ]);


    return {
      totalUsers,
      activeUsers,
      activeUsersCount: activeUsers,
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
}

export const analyticsService = new AnalyticsService();

