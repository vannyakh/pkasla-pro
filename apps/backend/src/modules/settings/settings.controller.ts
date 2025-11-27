import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { buildSuccessResponse } from '@/helpers/http-response';
import { asyncHandler } from '@/utils/async-handler';
import { settingsService } from './settings.service';

/**
 * Get current settings
 */
export const getSettingsHandler = asyncHandler(async (req: Request, res: Response) => {
  const includeSensitive = req.query.includeSensitive === 'true';
  
  const settings = includeSensitive
    ? await settingsService.getSettingsWithSensitive()
    : await settingsService.getSettings();
  
  return res.status(httpStatus.OK).json(
    buildSuccessResponse(settings, 'Settings retrieved successfully')
  );
});

/**
 * Update settings
 */
export const updateSettingsHandler = asyncHandler(async (req: Request, res: Response) => {
  const updatedSettings = await settingsService.updateSettings(req.body);
  
  return res.status(httpStatus.OK).json(
    buildSuccessResponse(updatedSettings, 'Settings updated successfully')
  );
});

/**
 * Get system information
 */
export const getSystemInfoHandler = asyncHandler(async (req: Request, res: Response) => {
  const systemInfo = await settingsService.getSystemInfo();
  
  return res.status(httpStatus.OK).json(
    buildSuccessResponse(systemInfo, 'System information retrieved successfully')
  );
});

