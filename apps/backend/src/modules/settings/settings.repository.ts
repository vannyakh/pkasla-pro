import type { UpdateQuery } from 'mongoose';
import { SettingsModel, type SettingsDocument } from './settings.model';

export class SettingsRepository {
  /**
   * Get the single settings document or create if it doesn't exist
   */
  async getOrCreate() {
    let settings = await SettingsModel.findOne().lean();
    if (!settings) {
      const newSettings = await SettingsModel.create({});
      return newSettings.toObject();
    }
    return settings;
  }

  /**
   * Get settings (without sensitive fields)
   */
  async get() {
    return SettingsModel.findOne().select('-emailPassword').lean();
  }

  /**
   * Get settings with sensitive fields (for internal use)
   */
  async getWithSensitive() {
    return SettingsModel.findOne().lean();
  }

  /**
   * Update settings
   */
  async update(payload: UpdateQuery<SettingsDocument>) {
    // Get existing settings or create new one
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = await SettingsModel.create({});
    }
    
    // Update settings
    return SettingsModel.findOneAndUpdate(
      { _id: settings._id },
      payload,
      { new: true, runValidators: true }
    ).select('-emailPassword').lean();
  }

  /**
   * Update specific fields
   */
  async updateFields(fields: Partial<SettingsDocument>) {
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = await SettingsModel.create({});
    }
    
    return SettingsModel.findOneAndUpdate(
      { _id: settings._id },
      { $set: fields },
      { new: true, runValidators: true }
    ).select('-emailPassword').lean();
  }
}

export const settingsRepository = new SettingsRepository();

