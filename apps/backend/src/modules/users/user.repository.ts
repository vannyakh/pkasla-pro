import type { FilterQuery, UpdateQuery } from 'mongoose';
import { UserModel, type UserDocument } from './user.model';

export class UserRepository {
  create(payload: Partial<UserDocument>) {
    return UserModel.create(payload);
  }

  findById(id: string) {
    return UserModel.findById(id).lean();
  }

  findByEmail(email: string) {
    return UserModel.findOne({ email }).lean();
  }

  findByEmailWithPassword(email: string) {
    return UserModel.findOne({ email }).select('+password');
  }

  findByEmailWithTwoFactor(email: string) {
    return UserModel.findOne({ email }).select('+password +twoFactorSecret +twoFactorBackupCodes');
  }

  findByPhone(phone: string) {
    return UserModel.findOne({ phone }).lean();
  }

  findByPhoneWithPassword(phone: string) {
    return UserModel.findOne({ phone }).select('+password');
  }

  findByPhoneWithTwoFactor(phone: string) {
    return UserModel.findOne({ phone }).select('+password +twoFactorSecret +twoFactorBackupCodes');
  }

  findByEmailOrPhoneWithTwoFactor(emailOrPhone: string) {
    // Normalize phone number (remove spaces, dashes, parentheses)
    const normalizedPhone = emailOrPhone.replace(/[\s\-\(\)]/g, '');
    
    // Try to find by email first, then by phone
    return UserModel.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: normalizedPhone },
      ],
    }).select('+password +twoFactorSecret +twoFactorBackupCodes');
  }

  findByProvider(provider: string, providerId: string) {
    return UserModel.findOne({ provider, providerId }).lean();
  }

  findByProviderOrEmail(provider: string, providerId: string, email: string) {
    return UserModel.findOne({
      $or: [
        { provider, providerId },
        { email: email.toLowerCase() },
      ],
    }).lean();
  }

  updateById(id: string, payload: UpdateQuery<UserDocument>) {
    return UserModel.findByIdAndUpdate(id, payload, { new: true }).lean();
  }

  list(filter: FilterQuery<UserDocument> = {}) {
    return UserModel.find(filter).lean();
  }

  countDocuments(filter: FilterQuery<UserDocument> = {}) {
    return UserModel.countDocuments(filter);
  }
}

export const userRepository = new UserRepository();

