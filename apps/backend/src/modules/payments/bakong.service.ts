import { env } from "@/config/environment";
import { AppError } from "@/common/errors/app-error";
import httpStatus from "http-status";
import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import QRCode from "qrcode";
import { logger } from "@/utils/logger";
import { logPaymentEvent } from "./payment-log.helper";

import { BakongKHQR } from "bakong-khqr";

if (!env.bakong?.accessToken) {
  console.warn(
    "Bakong access token not configured. Bakong payment features will not work."
  );
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
    type: "subscription" | "template";
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
  status: "pending" | "completed" | "failed" | "expired";
  amount: number;
  currency: string;
  timestamp?: string;
  payerAccountId?: string;
  payerName?: string;
}

// export type KHQRCurrency = Record<'usd' | 'khr', number>
export interface khqrData {
  currency: {
    usd: number;
    khr: number;
  };
}

export type merchantType = "merchant" | "individual";

export interface IndividualInfo {
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

export interface MerchantInfo extends IndividualInfo {
  merchantID: string;
}

export interface SourceInfo {
  appIconUrl: string;
  appName: string;
  appDeepLinkCallback: string;
}

export interface KHQRResponse {
  status: { code: number; errorCode: null | number; message: null | string };
  data: null | unknown;
}

class BakongService {
  private axiosInstance: AxiosInstance | null = null;

  private ensureBakong(): AxiosInstance {
    if (!env.bakong?.accessToken) {
      throw new AppError(
        "Bakong is not configured",
        httpStatus.SERVICE_UNAVAILABLE
      );
    }

    if (!env.bakong.merchantAccountId) {
      throw new AppError(
        "Bakong merchant account ID is not configured",
        httpStatus.SERVICE_UNAVAILABLE
      );
    }

    if (!this.axiosInstance) {
      this.axiosInstance = axios.create({
        baseURL: env.bakong.apiUrl,
        headers: {
          Authorization: `Bearer ${env.bakong.accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });
    }

    return this.axiosInstance;
  }

  /**
   * Generate KHQR code for payment
   */
  async createPayment(
    input: CreateBakongPaymentInput
  ): Promise<BakongPaymentResponse> {
    try {
      logger.info(
        {
          userId: input.userId,
          amount: input.amount,
          currency: input.currency,
          metadata: input.metadata,
        },
        "Creating Bakong payment"
      );

      const bakongInstance = this.ensureBakong();
      const currency = input.currency || "KHR";

      // Convert amount to smallest currency unit (KHR uses riels, no decimals)
      const amountInSmallestUnit =
        currency === "KHR"
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
        description:
          input.description ||
          `Payment for ${input.metadata?.type || "service"}`,
        metadata: {
          userId: input.userId,
          ...input.metadata,
        },
      };

      logger.debug(
        {
          transactionId,
          merchantAccountId,
          amountInSmallestUnit,
          currency,
        },
        "Calling Bakong API to generate QR code"
      );

      // Generate KHQR using bakong-khqr library
      const khqr = new BakongKHQR();

      // Set expiration time (15 minutes from now) for dynamic QR codes with amount
      // expirationTimestamp is required if amount is not null or zero
      const expirationTimestamp = Date.now() + 15 * 60 * 1000;

      // Currency codes according to ISO 4217
      const currencyCode = currency === "KHR" ? 116 : 840; // KHR = 116, USD = 840

      // Get merchant configuration from environment variables
      // These should be configured in your environment or settings
      const merchantName = process.env.BAKONG_MERCHANT_NAME || "Merchant";
      const merchantCity = process.env.BAKONG_MERCHANT_CITY || "Phnom Penh";
      const acquiringBankName =
        process.env.BAKONG_ACQUIRING_BANK_NAME || "BANK";

      // Create MerchantInfo for KHQR generation following the interface definition
      const merchantInfo: MerchantInfo = {
        merchantID: merchantAccountId,
        bakongAccountID: merchantAccountId,
        merchantName: merchantName,
        merchantCity: merchantCity,
        acquiringBank: acquiringBankName,
        currency: currencyCode,
        amount: amountInSmallestUnit,
        billNumber: transactionId,
        expirationTimestamp: expirationTimestamp, // Required for dynamic KHQR with amount
        storeLabel: paymentData.description
          ? paymentData.description.substring(0, 25)
          : undefined, // Max 25 chars
      };

      // Generate KHQR code
      const khqrResponse = khqr.generateMerchant(merchantInfo);

      // Check if generation was successful (status.code === 0 means success)
      if (khqrResponse.status.code !== 0 || !khqrResponse.data) {
        logger.error(
          {
            transactionId,
            error: khqrResponse.status,
          },
          "Failed to generate KHQR code"
        );
        throw new AppError(
          `Failed to generate KHQR code: ${khqrResponse.status.message || "Unknown error"}`,
          httpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Extract QR string from response data
      const khqrString = (khqrResponse.data as { qr: string; md5?: string }).qr;

      // Generate QR code image from KHQR string
      let qrCodeImage: string;
      try {
        qrCodeImage = await QRCode.toDataURL(khqrString, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 512,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
      } catch (qrError: any) {
        logger.error(
          {
            transactionId,
            error: qrError.message,
          },
          "Failed to generate QR code image"
        );
        throw new AppError(
          "Failed to generate QR code image",
          httpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Optionally call Bakong API for deeplink generation if needed
      // This is kept for backward compatibility but KHQR is now generated locally
      let apiResponse: any = null;
      try {
        apiResponse = await bakongInstance.post("/v1/generate_deeplink_by_qr", {
          ...paymentData,
          qrCode: khqrString,
        });
      } catch (apiError: any) {
        // Log but don't fail if API call fails - we have the KHQR string
        logger.warn(
          {
            transactionId,
            error: apiError.message,
          },
          "Bakong API deeplink generation failed, using local KHQR"
        );
      }

      const paymentResponse = {
        qrCode: apiResponse?.data?.qrCode || qrCodeImage,
        qrCodeData: khqrString,
        transactionId: transactionId,
        merchantAccountId: merchantAccountId,
        amount: input.amount,
        currency: currency,
        expiresAt:
          apiResponse?.data?.expiresAt ||
          new Date(expirationTimestamp).toISOString(),
      };

      logger.info(
        {
          transactionId,
          userId: input.userId,
          amount: input.amount,
          currency,
          paymentType: input.metadata?.type,
          expiresAt: paymentResponse.expiresAt,
        },
        "Bakong payment created successfully"
      );

      // Log payment event to database
      await logPaymentEvent({
        userId: input.userId,
        transactionId,
        paymentMethod: "bakong",
        paymentType: input.metadata?.type as
          | "subscription"
          | "template"
          | undefined,
        eventType: "payment_created",
        status: "pending",
        amount: input.amount,
        currency,
        planId: input.metadata?.planId,
        templateId: input.metadata?.templateId,
        metadata: input.metadata,
      });

      return paymentResponse;
    } catch (error: any) {
      logger.error(
        {
          error: error.message,
          userId: input.userId,
          amount: input.amount,
          currency: input.currency,
          responseStatus: error.response?.status,
          responseData: error.response?.data,
        },
        "Failed to create Bakong payment"
      );

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
  async getTransactionStatus(
    transactionId: string
  ): Promise<BakongTransactionStatus> {
    try {
      logger.debug({ transactionId }, "Checking Bakong transaction status");

      const bakongInstance = this.ensureBakong();

      const response = await bakongInstance.get(
        `/v1/transactions/${transactionId}`
      );

      const status = this.mapBakongStatus(response.data.status);
      const transactionStatus = {
        transactionId: response.data.transactionId || transactionId,
        status,
        amount: response.data.amount || 0,
        currency: response.data.currency || "KHR",
        timestamp: response.data.timestamp,
        payerAccountId: response.data.payerAccountId,
        payerName: response.data.payerName,
      };

      logger.info(
        {
          transactionId,
          status,
          amount: transactionStatus.amount,
          currency: transactionStatus.currency,
        },
        "Bakong transaction status retrieved"
      );

      // Log status check event to database
      await logPaymentEvent({
        transactionId,
        paymentMethod: "bakong",
        eventType: "transaction_status_checked",
        status: status,
        amount: transactionStatus.amount,
        currency: transactionStatus.currency,
        metadata: {
          payerAccountId: transactionStatus.payerAccountId,
          payerName: transactionStatus.payerName,
          timestamp: transactionStatus.timestamp,
        },
      });

      return transactionStatus;
    } catch (error: any) {
      logger.error(
        {
          error: error.message,
          transactionId,
          responseStatus: error.response?.status,
          responseData: error.response?.data,
        },
        "Failed to get Bakong transaction status"
      );

      if (error.response?.status === 404) {
        throw new AppError("Transaction not found", httpStatus.NOT_FOUND);
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
      logger.debug(
        {
          hasSignature: !!signature,
          payloadKeys: Object.keys(payload || {}),
        },
        "Verifying Bakong webhook signature"
      );

      if (!env.bakong?.webhookSecret) {
        logger.error({}, "Bakong webhook secret not configured");
        throw new AppError(
          "Bakong webhook secret not configured",
          httpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Implement webhook signature verification based on Bakong's method
      // This is typically HMAC-SHA256 or similar
      const expectedSignature = crypto
        .createHmac("sha256", env.bakong.webhookSecret)
        .update(JSON.stringify(payload))
        .digest("hex");

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        logger.warn(
          {
            receivedSignature: signature.substring(0, 10) + "...",
            expectedSignaturePrefix: expectedSignature.substring(0, 10) + "...",
          },
          "Bakong webhook signature verification failed"
        );
      } else {
        logger.debug({}, "Bakong webhook signature verified successfully");
      }

      return isValid;
    } catch (error: any) {
      logger.error(
        {
          error: error.message,
          hasSignature: !!signature,
        },
        "Bakong webhook signature verification error"
      );

      throw new AppError(
        `Webhook signature verification failed: ${error.message}`,
        httpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Map Bakong status to our status enum
   */
  private mapBakongStatus(
    status: string
  ): "pending" | "completed" | "failed" | "expired" {
    const statusMap: Record<
      string,
      "pending" | "completed" | "failed" | "expired"
    > = {
      PENDING: "pending",
      PROCESSING: "pending",
      SUCCESS: "completed",
      COMPLETED: "completed",
      FAILED: "failed",
      CANCELLED: "failed",
      EXPIRED: "expired",
      REJECTED: "failed",
    };

    return statusMap[status.toUpperCase()] || "pending";
  }

  /**
   * Create subscription payment
   */
  async createSubscriptionPayment(
    input: CreateBakongPaymentInput
  ): Promise<BakongPaymentResponse> {
    logger.info(
      {
        userId: input.userId,
        planId: input.metadata?.planId,
        planName: input.metadata?.planName,
        amount: input.amount,
      },
      "Creating Bakong subscription payment"
    );

    return this.createPayment({
      ...input,
      metadata: {
        ...input.metadata,
        type: "subscription",
      },
      description:
        input.description ||
        `Subscription: ${input.metadata?.planName || "Plan"}`,
    });
  }

  /**
   * Create template payment
   */
  async createTemplatePayment(
    input: CreateBakongPaymentInput
  ): Promise<BakongPaymentResponse> {
    logger.info(
      {
        userId: input.userId,
        templateId: input.metadata?.templateId,
        templateName: input.metadata?.templateName,
        amount: input.amount,
      },
      "Creating Bakong template payment"
    );

    return this.createPayment({
      ...input,
      metadata: {
        ...input.metadata,
        type: "template",
      },
      description:
        input.description ||
        `Template Purchase: ${input.metadata?.templateName || "Template"}`,
    });
  }
}

export const bakongService = new BakongService();
