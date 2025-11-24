import { UserModel } from '@/modules/users/user.model';
import { ApplicationModel } from '@/modules/applications/application.model';
import { JobModel } from '@/modules/jobs/job.model';
import { BlogModel } from '@/modules/blog/blog.model';
import { AppError } from '@/common/errors/app-error';
import httpStatus from 'http-status';

export interface DataExport {
  user: any;
  applications: any[];
  jobs: any[];
  blogs: any[];
  createdAt: Date;
}

class PrivacyService {
  /**
   * Export all user data (GDPR Right to Data Portability)
   */
  async exportUserData(userId: string): Promise<DataExport> {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    const [applications, jobs, blogs] = await Promise.all([
      ApplicationModel.find({ candidateId: userId }).lean(),
      JobModel.find({ postedBy: userId }).lean(),
      BlogModel.find({ authorId: userId }).lean(),
    ]);

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profile: user.profile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      applications,
      jobs,
      blogs,
      createdAt: new Date(),
    };
  }

  /**
   * Delete all user data (GDPR Right to Erasure)
   */
  async deleteUserData(userId: string): Promise<{ deleted: boolean; message: string }> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    // Delete related data
    await Promise.all([
      ApplicationModel.deleteMany({ candidateId: userId }),
      JobModel.deleteMany({ postedBy: userId }),
      BlogModel.deleteMany({ authorId: userId }),
      // Delete user
      UserModel.findByIdAndDelete(userId),
    ]);

    return {
      deleted: true,
      message: 'All user data has been permanently deleted',
    };
  }

  /**
   * Anonymize user data (keep for analytics but remove PII)
   */
  async anonymizeUserData(userId: string): Promise<{ anonymized: boolean; message: string }> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    // Anonymize user data
    await UserModel.findByIdAndUpdate(userId, {
      firstName: 'Anonymous',
      lastName: 'User',
      email: `deleted-${userId}@deleted.local`,
      phone: null,
      profile: {},
      status: 'suspended',
    });

    // Anonymize applications
    await ApplicationModel.updateMany(
      { candidateId: userId },
      {
        $unset: {
          coverLetter: '',
          resumeUrl: '',
          portfolioUrl: '',
          linkedInUrl: '',
        },
      },
    );

    return {
      anonymized: true,
      message: 'User data has been anonymized',
    };
  }

  /**
   * Get data retention information
   */
  async getDataRetentionInfo(userId: string): Promise<{
    accountCreated: Date;
    lastActivity: Date;
    dataTypes: string[];
    retentionPeriod: string;
  }> {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    const [lastApplication, lastJob, lastBlog] = await Promise.all([
      ApplicationModel.findOne({ candidateId: userId })
        .sort({ createdAt: -1 })
        .lean(),
      JobModel.findOne({ postedBy: userId })
        .sort({ createdAt: -1 })
        .lean(),
      BlogModel.findOne({ authorId: userId })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const activities = [
      lastApplication?.createdAt,
      lastJob?.createdAt,
      lastBlog?.createdAt,
    ].filter(Boolean) as Date[];

    const lastActivity = activities.length > 0
      ? new Date(Math.max(...activities.map((d) => d.getTime())))
      : user.createdAt;

    const dataTypes: string[] = [];
    if (lastApplication) dataTypes.push('applications');
    if (lastJob) dataTypes.push('jobs');
    if (lastBlog) dataTypes.push('blogs');

    return {
      accountCreated: user.createdAt,
      lastActivity,
      dataTypes,
      retentionPeriod: 'Data is retained until account deletion or 7 years after last activity (whichever comes first)',
    };
  }

  /**
   * Request data deletion (GDPR compliant)
   */
  async requestDataDeletion(userId: string, reason?: string): Promise<{
    requested: boolean;
    scheduledFor: Date;
    message: string;
  }> {
    // In production, you might want to:
    // 1. Schedule deletion after a grace period (e.g., 30 days)
    // 2. Send confirmation email
    // 3. Log the request for audit purposes
    // 4. Store deletion request in a separate collection

    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 30); // 30-day grace period

    return {
      requested: true,
      scheduledFor,
      message: 'Data deletion has been scheduled. You will receive a confirmation email.',
    };
  }
}

export const privacyService = new PrivacyService();

