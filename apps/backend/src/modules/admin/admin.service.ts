import httpStatus from 'http-status';
import { AppError } from '@/common/errors/app-error';
import { userRepository } from '@/modules/users/user.repository';

class AdminService {
 
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

}

export const adminService = new AdminService();

