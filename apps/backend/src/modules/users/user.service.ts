import httpStatus from 'http-status';
import { AppError } from '@/common/errors/app-error';
import { userRepository } from './user.repository';
import type { UserDocument } from './user.model';
import type { UserRole, UserStatus, OAuthProvider } from './user.types';
import { buildSuccessResponse } from '@/helpers/http-response';

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string; // Optional for OAuth users
  role?: UserRole;
  provider?: OAuthProvider;
  providerId?: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  provider?: OAuthProvider;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

type UserSource = UserDocument | (Record<string, any> & { _id?: unknown }) | null;

/**
 * Generates a default avatar URL using the user's name or email
 */
const getDefaultAvatarUrl = (name?: string, email?: string): string => {
  const username = name 
    ? encodeURIComponent(name.trim().replace(/\s+/g, ''))
    : email 
    ? encodeURIComponent(email.split('@')[0])
    : 'user';
  return `https://avatar.iran.liara.run/public/?username=${username}`;
};

const sanitizeUser = (user: UserSource): UserResponse | null => {
  if (!user) {
    return null;
  }
  const userObj =
    typeof (user as UserDocument).toObject === 'function'
      ? (user as UserDocument).toObject()
      : user;
  const { _id, password, __v, ...rest } = userObj as Record<string, any>;
  const sanitized = {
    ...(rest as Omit<UserResponse, 'id' | 'avatar'>),
    id: (_id ?? (rest as Record<string, any>).id).toString(),
  } as UserResponse;
  
  // Set default avatar if not provided or empty
  if (!sanitized.avatar || sanitized.avatar.trim() === '') {
    sanitized.avatar = getDefaultAvatarUrl(sanitized.name, sanitized.email);
  }
  
  return sanitized;
};

class UserService {
  async create(payload: CreateUserInput) {
    const existing = await userRepository.findByEmail(payload.email);
    if (existing) {
      throw new AppError('Email already in use', httpStatus.CONFLICT);
    }
    const user = await userRepository.create(payload);
    const safeUser = sanitizeUser(user);
    if (!safeUser) {
      throw new AppError('Unable to create user', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeUser;
  }

  async findById(id: string) {
    const user = await userRepository.findById(id);
    return sanitizeUser(user as unknown as UserDocument);
  }

  async findByIdOrFail(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await userRepository.findByEmail(email);
    return sanitizeUser(user as unknown as UserDocument);
  }

  async findByEmailWithPassword(email: string) {
    const user = await userRepository.findByEmailWithPassword(email);
    return user as (UserDocument & { password: string }) | null;
  }

  async findByEmailWithTwoFactor(email: string) {
    const user = await userRepository.findByEmailWithTwoFactor(email);
    return user as (UserDocument & {
      password: string;
      twoFactorSecret?: string;
      twoFactorBackupCodes?: string[];
    }) | null;
  }

  async findByPhoneWithTwoFactor(phone: string) {
    const user = await userRepository.findByPhoneWithTwoFactor(phone);
    return user as (UserDocument & {
      password: string;
      twoFactorSecret?: string;
      twoFactorBackupCodes?: string[];
    }) | null;
  }

  async findByEmailOrPhoneWithTwoFactor(emailOrPhone: string) {
    const user = await userRepository.findByEmailOrPhoneWithTwoFactor(emailOrPhone);
    return user as (UserDocument & {
      password: string;
      twoFactorSecret?: string;
      twoFactorBackupCodes?: string[];
    }) | null;
  }

  async findByProvider(provider: string, providerId: string) {
    const user = await userRepository.findByProvider(provider, providerId);
    return sanitizeUser(user as unknown as UserDocument);
  }

  async findByProviderOrEmail(provider: string, providerId: string, email: string) {
    const user = await userRepository.findByProviderOrEmail(provider, providerId, email);
    return sanitizeUser(user as unknown as UserDocument);
  }

  async updateTwoFactor(id: string, payload: {
    twoFactorSecret?: string;
    twoFactorEnabled?: boolean;
    twoFactorBackupCodes?: string[];
  }) {
    const updated = await userRepository.updateById(id, payload);
    if (!updated) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    return sanitizeUser(updated as unknown as UserDocument);
  }

  async updateProfile(id: string, payload: UpdateUserInput) {
    // Get current user to merge profile properly
    const currentUser = await userRepository.findById(id);
    if (!currentUser) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    // Build update object with proper merging for nested profile
    const updateData: Record<string, any> = {};
    
    if (payload.name !== undefined) {
      updateData.name = payload.name;
    }
    
    if (payload.phone !== undefined) {
      // Check if phone is already in use by another user
      if (payload.phone) {
        const existingPhoneUser = await userRepository.findByPhone(payload.phone);
        if (existingPhoneUser && existingPhoneUser._id?.toString() !== id) {
          throw new AppError('Phone number already in use', httpStatus.CONFLICT);
        }
      }
      updateData.phone = payload.phone || null;
    }
    
    if (payload.avatar !== undefined) {
      updateData.avatar = payload.avatar || null;
    }
    
    const updated = await userRepository.updateById(id, { $set: updateData });
    if (!updated) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    const safeUser = sanitizeUser(updated as unknown as UserDocument);
    if (!safeUser) {
      throw new AppError('Unable to update user', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return safeUser;
  }

  async list(page: number = 1, pageSize: number = 10) {
    const [users, total] = await Promise.all([
      userRepository.listPaginated({}, page, pageSize),
      userRepository.countDocuments({}),
    ]);

    const sanitizedUsers = users
      .map((user) => sanitizeUser(user as unknown as UserDocument))
      .filter(Boolean) as UserResponse[];

    return buildSuccessResponse(
      {
        items: sanitizedUsers,
        total,
        page,
        pageSize,
      },
      'Users fetched successfully',
    );
  }
}

export const userService = new UserService();

