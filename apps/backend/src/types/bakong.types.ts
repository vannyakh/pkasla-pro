import type { PaymentType, PaymentStatus } from '../modules/payments/payment-log.model';

/**
 * Supported currencies for Bakong payments
 */
export type BakongCurrency = 'USD' | 'KHR';

/**
 * ISO 4217 currency codes
 */
export const CURRENCY_CODES = {
  KHR: 116,
  USD: 840,
} as const;

/**
 * Merchant type for KHQR generation
 */
export type MerchantType = 'merchant' | 'individual';

/**
 * Payment metadata for Bakong payments
 */
export interface BakongPaymentMetadata {
  planId?: string;
  planName?: string;
  billingCycle?: string;
  templateId?: string;
  templateName?: string;
  type: PaymentType;
}

/**
 * Input for creating a Bakong payment
 */
export interface CreateBakongPaymentInput {
  userId: string;
  amount: number;
  currency?: BakongCurrency;
  description?: string;
  metadata?: BakongPaymentMetadata;
}

/**
 * Response from creating a Bakong payment
 */
export interface BakongPaymentResponse {
  qrCode: string;
  qrCodeData: string;
  transactionId: string;
  merchantAccountId: string;
  amount: number;
  currency: BakongCurrency;
  expiresAt?: string;
}

/**
 * Transaction status from Bakong
 */
export interface BakongTransactionStatus {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  currency: BakongCurrency;
  timestamp?: string;
  payerAccountId?: string;
  payerName?: string;
}

/**
 * KHQR currency data structure
 */
export interface KHQRCurrencyData {
  currency: {
    usd: number;
    khr: number;
  };
}

/**
 * Base information for individual merchant KHQR
 */
export interface IndividualMerchantInfo {
  bakongAccountID: string;
  merchantName: string;
  merchantCity?: string;
  accountInformation?: string;
  acquiringBank: string;
  currency?: number;
  amount?: number;
  billNumber?: string;
  storeLabel?: string;
  terminalLabel?: string;
  mobileNumber?: string;
  purposeOfTransaction?: string;
  languagePreference?: string;
  merchantNameAlternateLanguage?: string;
  merchantCityAlternateLanguage?: string;
  upiMerchantAccount?: string;
  expirationTimestamp?: number;
}

/**
 * Merchant information for KHQR generation (with merchant ID)
 */
export interface MerchantInfo extends IndividualMerchantInfo {
  merchantID: string;
}

/**
 * Source application information for KHQR
 */
export interface SourceInfo {
  appIconUrl: string;
  appName: string;
  appDeepLinkCallback: string;
}

/**
 * Response structure from Bakong KHQR library
 */
export interface KHQRResponse {
  status: {
    code: number;
    errorCode: null | number;
    message: null | string;
  };
  data: null | {
    qr: string;
    md5?: string;
  };
}

/**
 * Bakong API error response structure
 */
export interface BakongApiError {
  message?: string;
  error?: string;
  code?: string | number;
}

