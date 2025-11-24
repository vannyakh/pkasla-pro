import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { hashPassword, comparePassword } from './password';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerificationResult {
  valid: boolean;
  usedBackupCode?: boolean;
}

/**
 * Generate a new 2FA secret for a user
 */
export const generateTwoFactorSecret = (email: string, serviceName: string = 'SomborkJobs') => {
  const secret = speakeasy.generateSecret({
    name: `${serviceName} (${email})`,
    issuer: serviceName,
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
};

/**
 * Generate QR code URL for 2FA setup
 */
export const generateQRCode = async (otpauthUrl: string): Promise<string> => {
  return QRCode.toDataURL(otpauthUrl);
};

/**
 * Verify a TOTP token against a secret
 */
export const verifyTwoFactorToken = (
  token: string,
  secret: string,
  window: number = 2,
): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window,
  });
};

/**
 * Generate backup codes for 2FA recovery
 */
export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
};

/**
 * Hash backup codes for storage
 */
export const hashBackupCodes = async (codes: string[]): Promise<string[]> => {
  return Promise.all(codes.map((code) => hashPassword(code)));
};

/**
 * Verify a backup code against hashed codes
 */
export const verifyBackupCode = async (
  code: string,
  hashedCodes: string[],
): Promise<{ valid: boolean; remainingCodes: string[] }> => {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await comparePassword(code, hashedCodes[i]);
    if (isValid) {
      // Remove used backup code
      const remainingCodes = hashedCodes.filter((_, index) => index !== i);
      return { valid: true, remainingCodes };
    }
  }
  return { valid: false, remainingCodes: hashedCodes };
};

