import httpStatus from 'http-status';
import { AppError } from '@/common/errors/app-error';
import { userRepository } from '@/modules/users/user.repository';
import { UserDocument } from '@/modules/users/user.model';


const sanitizeUser = (user: UserDocument): UserDocument | null => {
  if (!user) {
    return null;
  }
  const userObj =
    typeof (user as UserDocument).toObject === 'function'
      ? (user as UserDocument).toObject()
      : user;
  const { _id, password, __v, ...rest } = userObj as Record<string, any>;
  return {
    ...(rest as Omit<UserDocument, 'id'>),
    id: (_id ?? (rest as Record<string, any>).id).toString(),
  };
};

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
    const query: any = {};

    if (filters?.role) {
      query.role = filters.role;
    }
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      userRepository.listPaginated(query, page, limit, { createdAt: -1 }),
      userRepository.countDocuments(query),
    ]);

    const sanitizedUsers = users.map((user) => sanitizeUser(user as unknown as UserDocument));

    return {
      items: sanitizedUsers,
      total,
      page,
      limit,
    };
  }

}

export const adminService = new AdminService();

