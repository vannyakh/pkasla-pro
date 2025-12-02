import { env } from '@/config/environment';
import { AppError } from '@/common/errors/app-error';
import httpStatus from 'http-status';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { logger } from '@/utils/logger';

if (!env.bakong?.accessToken) {
  console.warn('Bakong access token not configured. Bakong payment features will not work.');
}

export interface CreateBakongPaymentInput {
  userId: string;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: {
    planId?: string;
    planName?: string;
    billingCycle?: string;
    templateId?: string;
    templateName?: string;
    type: 'subscription' | 'template';
  };
}

export interface BakongPaymentResponse {
  qrCode: string;
  qrCodeData: string;
  transactionId: string;
  merchantAccountId: string;
  amount: number;
  currency: string;
  expiresAt?: string;
}

export interface BakongTransactionStatus {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  amount: number;
  currency: string;
  timestamp?: string;
  payerAccountId?: string;
  payerName?: string;
}

class BakongService {
  private axiosInstance: AxiosInstance | null = null;

  private ensureBakong(): AxiosInstance {
    if (!env.bakong?.accessToken) {
      throw new AppError('Bakong is not configured', httpStatus.SERVICE_UNAVAILABLE);
    }

    if (!env.bakong.merchantAccountId) {
      throw new AppError('Bakong merchant account ID is not configured', httpStatus.SERVICE_UNAVAILABLE);
    }

    if (!this.axiosInstance) {
      this.axiosInstance = axios.create({
        baseURL: env.bakong.apiUrl,
        headers: {
          'Authorization': `Bearer ${env.bakong.accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
    }

    return this.axiosInstance;
  }

  /**
   * Generate KHQR code for payment
   */
  async createPayment(input: CreateBakongPaymentInput): Promise<BakongPaymentResponse> {
    try {
      logger.info({
        userId: input.userId,
        amount: input.amount,
        currency: input.currency,
        metadata: input.metadata,
      }, 'Creating Bakong payment');

      const bakongInstance = this.ensureBakong();
      const currency = input.currency || 'KHR';
      
      // Convert amount to smallest currency unit (KHR uses riels, no decimals)
      const amountInSmallestUnit = currency === 'KHR' 
        ? Math.round(input.amount) 
        : Math.round(input.amount * 100);

      // Generate transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Ensure merchant account ID is available
      const merchantAccountId = env.bakong!.merchantAccountId!;

      // Prepare payment request
      const paymentData = {
        merchantAccountId: merchantAccountId,
        amount: amountInSmallestUnit,
        currency: currency,
        transactionId: transactionId,
        description: input.description || `Payment for ${input.metadata?.type || 'service'}`,
        metadata: {
          userId: input.userId,
          ...input.metadata,
        },
      };

      logger.debug({
        transactionId,
        merchantAccountId,
        amountInSmallestUnit,
        currency,
      }, 'Calling Bakong API to generate QR code');

      // Call Bakong API to generate QR code
      // Note: Actual API endpoint may vary based on Bakong documentation
      const response = await bakongInstance.post('/api/v1/payments/qr/generate', paymentData);

      // Generate KHQR string format
      // KHQR format: 000201010212... (EMV QR Code standard)
      const khqrData = this.generateKHQRString({
        merchantAccountId: merchantAccountId,
        amount: amountInSmallestUnit,
        currency: currency,
        transactionId: transactionId,
        description: paymentData.description,
      });

      const paymentResponse = {
        qrCode: response.data.qrCode || khqrData,
        qrCodeData: khqrData,
        transactionId: transactionId,
        merchantAccountId: merchantAccountId,
        amount: input.amount,
        currency: currency,
        expiresAt: response.data.expiresAt,
      };

      logger.info({
        transactionId,
        userId: input.userId,
        amount: input.amount,
        currency,
        paymentType: input.metadata?.type,
        expiresAt: paymentResponse.expiresAt,
      }, 'Bakong payment created successfully');

      return paymentResponse;
    } catch (error: any) {
      logger.error({
        error: error.message,
        userId: input.userId,
        amount: input.amount,
        currency: input.currency,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      }, 'Failed to create Bakong payment');

      if (error.response) {
        throw new AppError(
          `Bakong API error: ${error.response.data?.message || error.response.statusText}`,
          error.response.status || httpStatus.INTERNAL_SERVER_ERROR
        );
      }
      throw new AppError(
        `Failed to create Bakong payment: ${error.message}`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Check transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<BakongTransactionStatus> {
    try {
      logger.debug({ transactionId }, 'Checking Bakong transaction status');

      const bakongInstance = this.ensureBakong();

      const response = await bakongInstance.get(`/api/v1/transactions/${transactionId}`);

      const status = this.mapBakongStatus(response.data.status);
      const transactionStatus = {
        transactionId: response.data.transactionId || transactionId,
        status,
        amount: response.data.amount || 0,
        currency: response.data.currency || 'KHR',
        timestamp: response.data.timestamp,
        payerAccountId: response.data.payerAccountId,
        payerName: response.data.payerName,
      };

      logger.info({
        transactionId,
        status,
        amount: transactionStatus.amount,
        currency: transactionStatus.currency,
      }, 'Bakong transaction status retrieved');

      return transactionStatus;
    } catch (error: any) {
      logger.error({
        error: error.message,
        transactionId,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      }, 'Failed to get Bakong transaction status');

      if (error.response?.status === 404) {
        throw new AppError('Transaction not found', httpStatus.NOT_FOUND);
      }
      if (error.response) {
        throw new AppError(
          `Bakong API error: ${error.response.data?.message || error.response.statusText}`,
          error.response.status || httpStatus.INTERNAL_SERVER_ERROR
        );
      }
      throw new AppError(
        `Failed to get transaction status: ${error.message}`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      logger.debug({
        hasSignature: !!signature,
        payloadKeys: Object.keys(payload || {}),
      }, 'Verifying Bakong webhook signature');

      if (!env.bakong?.webhookSecret) {
        logger.error({}, 'Bakong webhook secret not configured');
        throw new AppError('Bakong webhook secret not configured', httpStatus.INTERNAL_SERVER_ERROR);
      }

      // Implement webhook signature verification based on Bakong's method
      // This is typically HMAC-SHA256 or similar
      const expectedSignature = crypto
        .createHmac('sha256', env.bakong.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        logger.warn({
          receivedSignature: signature.substring(0, 10) + '...',
          expectedSignaturePrefix: expectedSignature.substring(0, 10) + '...',
        }, 'Bakong webhook signature verification failed');
      } else {
        logger.debug({}, 'Bakong webhook signature verified successfully');
      }

      return isValid;
    } catch (error: any) {
      logger.error({
        error: error.message,
        hasSignature: !!signature,
      }, 'Bakong webhook signature verification error');

      throw new AppError(
        `Webhook signature verification failed: ${error.message}`,
        httpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Generate KHQR string in EMV QR Code format
   * KHQR follows EMV QR Code standard with Cambodia-specific fields
   */
  private generateKHQRString(data: {
    merchantAccountId: string;
    amount: number;
    currency: string;
    transactionId: string;
    description?: string;
  }): string {
    // KHQR format structure (simplified version)
    // Actual implementation should follow KHQR specification from NBC
    const payloadFormatIndicator = '000201'; // EMV QR Code
    const pointOfInitiationMethod = '0102'; // Static QR
    const merchantAccountInfo = `26${String(data.merchantAccountId.length + 4).padStart(2, '0')}00${String(data.merchantAccountId.length).padStart(2, '0')}${data.merchantAccountId}`;
    const merchantCategoryCode = '52040000'; // General
    const transactionCurrency = `53${String(data.currency.length).padStart(2, '0')}${data.currency}`;
    const transactionAmount = `54${String(String(data.amount).length).padStart(2, '0')}${data.amount.toFixed(2)}`;
    const countryCode = '5802KH';
    const merchantName = '5802KH'; // Placeholder
    const additionalData = data.description 
      ? `62${String(data.description.length + 4).padStart(2, '0')}05${String(data.description.length).padStart(2, '0')}${data.description}`
      : '';

    const qrString = 
      payloadFormatIndicator +
      pointOfInitiationMethod +
      merchantAccountInfo +
      merchantCategoryCode +
      transactionCurrency +
      transactionAmount +
      countryCode +
      merchantName +
      additionalData;

    // Add CRC (Cyclic Redundancy Check)
    const crc = this.calculateCRC(qrString + '6304');
    return qrString + '6304' + crc;
  }

  /**
   * Calculate CRC16 for KHQR
   */
  private calculateCRC(data: string): string {
    const polynomial = 0x1021;
    let crc = 0xFFFF;

    for (let i = 0; i < data.length; i++) {
      crc ^= (data.charCodeAt(i) << 8);
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * Map Bakong status to our status enum
   */
  private mapBakongStatus(status: string): 'pending' | 'completed' | 'failed' | 'expired' {
    const statusMap: Record<string, 'pending' | 'completed' | 'failed' | 'expired'> = {
      'PENDING': 'pending',
      'PROCESSING': 'pending',
      'SUCCESS': 'completed',
      'COMPLETED': 'completed',
      'FAILED': 'failed',
      'CANCELLED': 'failed',
      'EXPIRED': 'expired',
      'REJECTED': 'failed',
    };

    return statusMap[status.toUpperCase()] || 'pending';
  }

  /**
   * Create subscription payment
   */
  async createSubscriptionPayment(
    input: CreateBakongPaymentInput
  ): Promise<BakongPaymentResponse> {
    logger.info({
      userId: input.userId,
      planId: input.metadata?.planId,
      planName: input.metadata?.planName,
      amount: input.amount,
    }, 'Creating Bakong subscription payment');

    return this.createPayment({
      ...input,
      metadata: {
        ...input.metadata,
        type: 'subscription',
      },
      description: input.description || `Subscription: ${input.metadata?.planName || 'Plan'}`,
    });
  }

  /**
   * Create template payment
   */
  async createTemplatePayment(
    input: CreateBakongPaymentInput
  ): Promise<BakongPaymentResponse> {
    logger.info({
      userId: input.userId,
      templateId: input.metadata?.templateId,
      templateName: input.metadata?.templateName,
      amount: input.amount,
    }, 'Creating Bakong template payment');

    return this.createPayment({
      ...input,
      metadata: {
        ...input.metadata,
        type: 'template',
      },
      description: input.description || `Template Purchase: ${input.metadata?.templateName || 'Template'}`,
    });
  }
}

export const bakongService = new BakongService();

