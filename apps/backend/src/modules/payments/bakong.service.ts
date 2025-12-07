import { env } from "@/config/environment";
import { AppError } from "@/common/errors/app-error";
import httpStatus from "http-status";
import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import QRCode from "qrcode";
import { logger } from "@/utils/logger";
import { logPaymentEvent } from "./payment-log.helper";
import { BakongKHQR } from "bakong-khqr";
import type {
  CreateBakongPaymentInput,
  BakongPaymentResponse,
  BakongTransactionStatus,
  MerchantInfo,
  KHQRResponse,
  BakongCurrency,
} from "@/types/bakong.types";
import { CURRENCY_CODES } from "@/types/bakong.types";

if (!env.bakong?.accessToken) {
  console.warn(
    "Bakong access token not configured. Bakong payment features will not work."
  );
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

      const currency: BakongCurrency = (input.currency || "USD") as BakongCurrency;

      // Generate transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Ensure merchant account ID is available
      const merchantAccountId = env.bakong!.merchantAccountId!;

      // Prepare payment request
      const paymentData = {
        merchantAccountId: merchantAccountId,
        amount: input.amount,
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
          amount: input.amount,
          currency,
        },
        "Calling Bakong API to generate QR code"
      );

      // Generate KHQR using bakong-khqr library
      const khqr = new BakongKHQR();

      // Set expiration time (2 minutes from now) for dynamic QR codes with amount
      // expirationTimestamp is required if amount is not null or zero
      const expirationTimestamp = Date.now() + 2 * 60 * 1000;

      // Currency codes according to ISO 4217
      const currencyCode = CURRENCY_CODES[currency];

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
        amount: input.amount,
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

      // Extract QR string and MD5 from response data
      const khqrString = (khqrResponse.data as KHQRResponse['data'])?.qr;
      const md5Hash = (khqrResponse.data as KHQRResponse['data'])?.md5;
      
      if (!khqrString) {
        throw new AppError(
          "Failed to generate KHQR code: No QR data returned",
          httpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Generate MD5 hash from KHQR string if not provided
      const finalMd5Hash = md5Hash || crypto.createHash('md5').update(khqrString).digest('hex');

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

      const paymentResponse = {
        qrCode: qrCodeImage,
        qrCodeData: khqrString,
        transactionId: transactionId,
        merchantAccountId: merchantAccountId,
        amount: input.amount,
        currency: currency,
        expiresAt: new Date(expirationTimestamp).toISOString(),
      };

      // Log payment event to database
      await logPaymentEvent({
        userId: input.userId,
        transactionId,
        paymentMethod: "bakong",
        paymentType: input.metadata?.type,
        eventType: "payment_created",
        status: "pending",
        amount: input.amount,
        currency,
        planId: input.metadata?.planId,
        templateId: input.metadata?.templateId,
        metadata: {
          ...input.metadata,
          qrCodeData: khqrString,
          md5Hash: finalMd5Hash,
        },
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
   * Check transaction status using MD5 hash
   * @param transactionId - Transaction ID or MD5 hash
   * @param md5Hash - Optional MD5 hash (if provided, will skip database lookup)
   */
  async getTransactionStatus(
    transactionId: string,
    md5Hash?: string
  ): Promise<BakongTransactionStatus> {
    try {
      logger.debug({ transactionId, hasDirectMd5: !!md5Hash }, "Checking Bakong transaction status");

      const bakongInstance = this.ensureBakong();

      let finalMd5Hash: string | null = md5Hash || null;

      // If MD5 hash is not provided directly, retrieve from payment log
      if (!finalMd5Hash) {
        const { PaymentLogModel } = await import("./payment-log.model");
        const paymentLog = await PaymentLogModel.findOne({
          transactionId,
          paymentMethod: "bakong",
          eventType: "payment_created",
        }).sort({ createdAt: -1 });

        if (paymentLog?.metadata?.md5Hash) {
          finalMd5Hash = paymentLog.metadata.md5Hash;
        } else if (paymentLog?.metadata?.qrCodeData) {
          // Generate MD5 from stored KHQR string
          finalMd5Hash = crypto.createHash('md5').update(paymentLog.metadata.qrCodeData).digest('hex');
        } else {
          throw new AppError(
            "MD5 hash not found for transaction. Cannot check status.",
            httpStatus.NOT_FOUND
          );
        }
      }

      logger.debug({ transactionId, md5Hash: finalMd5Hash?.substring(0, 8) + "..." }, "Using MD5 hash to check transaction status");

      // Use MD5 hash to check transaction status
      const response = await bakongInstance.post(
        `/v1/check_transaction_by_md5`,
        { md5: finalMd5Hash }
      );

      // Log raw response for debugging
      logger.debug(
        {
          transactionId,
          responseCode: response.data?.responseCode,
          responseMessage: response.data?.responseMessage,
        },
        "Bakong API response received"
      );

      // Check response code
      const responseCode = response.data?.responseCode;
      const responseMessage = response.data?.responseMessage || "Unknown error";
      const responseData = response.data?.data;

      // Handle failed or pending payment (responseCode !== 0)
      if (responseCode !== 0 || !responseData) {
        logger.info(
          {
            transactionId,
            responseCode,
            responseMessage,
          },
          "Transaction not found or pending"
        );

        // Return pending status for transactions that haven't been processed yet
        const transactionStatus: BakongTransactionStatus = {
          transactionId,
          status: "pending",
          amount: 0,
          currency: "USD" as BakongCurrency,
          timestamp: undefined,
          payerAccountId: undefined,
          payerName: undefined,
        };

        // Log status check event
        await logPaymentEvent({
          transactionId,
          paymentMethod: "bakong",
          eventType: "transaction_status_checked",
          status: "pending",
          amount: 0,
          currency: "USD",
          metadata: {
            responseCode,
            responseMessage,
            md5Hash: finalMd5Hash?.substring(0, 8) + "...",
          },
        });

        return transactionStatus;
      }

      // Handle success response (responseCode === 0)
      // Map transaction details from Bakong API response
      const transactionStatus: BakongTransactionStatus = {
        transactionId: responseData.externalRef || transactionId,
        status: "completed", // If we get data, transaction is completed
        amount: responseData.amount || 0,
        currency: (responseData.currency || "USD") as BakongCurrency,
        timestamp: responseData.acknowledgedDateMs 
          ? new Date(responseData.acknowledgedDateMs).toISOString()
          : responseData.createdDateMs
          ? new Date(responseData.createdDateMs).toISOString()
          : undefined,
        payerAccountId: responseData.fromAccountId,
        payerName: undefined, // Not provided in API response
      };

      logger.info(
        {
          transactionId: transactionStatus.transactionId,
          status: transactionStatus.status,
          amount: transactionStatus.amount,
          currency: transactionStatus.currency,
          hasPayerInfo: !!(transactionStatus.payerAccountId || transactionStatus.payerName),
        },
        "Bakong transaction status retrieved successfully"
      );

      // If payment is completed, update payment log and trigger purchase/subscription creation
      if (transactionStatus.status === "completed") {
        try {
          const { PaymentLogModel } = await import("./payment-log.model");
          const paymentLog = await PaymentLogModel.findOne({
            transactionId: transactionStatus.transactionId,
            paymentMethod: "bakong",
            eventType: "payment_created",
          }).sort({ createdAt: -1 });

          if (paymentLog) {
            // Update payment log status if it's still pending
            if (paymentLog.status === "pending") {
              paymentLog.status = "completed";
              await paymentLog.save();
              logger.info(
                { transactionId: transactionStatus.transactionId },
                "Updated payment log status to completed"
              );
            }

            // Trigger purchase/subscription creation if metadata exists
            const metadata = paymentLog.metadata || {};
            const userId = paymentLog.userId?.toString();
            const paymentType = paymentLog.paymentType;

            if (userId && paymentType) {
              if (paymentType === "subscription" && metadata.planId) {
                const { UserSubscriptionModel } = await import("@/modules/subscriptions/user-subscription.model");
                const { userSubscriptionService } = await import("@/modules/subscriptions/user-subscription.service");
                // Check if subscription already exists by transactionId
                const existingSubscription = await UserSubscriptionModel.findOne({
                  transactionId: transactionStatus.transactionId,
                });
                if (!existingSubscription) {
                  await userSubscriptionService.create({
                    userId,
                    planId: metadata.planId,
                    paymentMethod: "bakong",
                    transactionId: transactionStatus.transactionId,
                    autoRenew: true,
                  });
                  logger.info(
                    { userId, planId: metadata.planId, transactionId: transactionStatus.transactionId },
                    "Subscription created from status check"
                  );
                  // Log payment succeeded event
                  await logPaymentEvent({
                    userId,
                    transactionId: transactionStatus.transactionId,
                    paymentMethod: "bakong",
                    paymentType: "subscription",
                    eventType: "payment_succeeded",
                    status: "completed",
                    amount: transactionStatus.amount,
                    currency: transactionStatus.currency,
                    planId: metadata.planId,
                    metadata: {
                      planName: metadata.planName,
                      billingCycle: metadata.billingCycle,
                      triggeredBy: "status_check",
                    },
                  });
                } else {
                  logger.debug(
                    { userId, planId: metadata.planId, transactionId: transactionStatus.transactionId },
                    "Subscription already exists, skipping creation"
                  );
                }
              } else if (paymentType === "template" && metadata.templateId) {
                const { TemplatePurchaseModel } = await import("@/modules/t/template-purchase.model");
                const { templatePurchaseService } = await import("@/modules/t/template-purchase.service");
                // Check if purchase already exists by transactionId
                const existingPurchase = await TemplatePurchaseModel.findOne({
                  transactionId: transactionStatus.transactionId,
                });
                if (!existingPurchase) {
                  await templatePurchaseService.create({
                    userId,
                    templateId: metadata.templateId,
                    paymentMethod: "bakong",
                    transactionId: transactionStatus.transactionId,
                  });
                  logger.info(
                    { userId, templateId: metadata.templateId, transactionId: transactionStatus.transactionId },
                    "Template purchase created from status check"
                  );
                  // Log payment succeeded event
                  await logPaymentEvent({
                    userId,
                    transactionId: transactionStatus.transactionId,
                    paymentMethod: "bakong",
                    paymentType: "template",
                    eventType: "payment_succeeded",
                    status: "completed",
                    amount: transactionStatus.amount,
                    currency: transactionStatus.currency,
                    templateId: metadata.templateId,
                    metadata: {
                      templateName: metadata.templateName,
                      triggeredBy: "status_check",
                    },
                  });
                } else {
                  logger.debug(
                    { userId, templateId: metadata.templateId, transactionId: transactionStatus.transactionId },
                    "Template purchase already exists, skipping creation"
                  );
                }
              }
            }
          }
        } catch (error: any) {
          // Log error but don't fail the status check
          logger.error(
            {
              error: error.message,
              transactionId: transactionStatus.transactionId,
            },
            "Failed to process completed payment"
          );
        }
      }

      // Log status check event to database
      await logPaymentEvent({
        transactionId: transactionStatus.transactionId,
        paymentMethod: "bakong",
        eventType: "transaction_status_checked",
        status: transactionStatus.status,
        amount: transactionStatus.amount,
        currency: transactionStatus.currency,
        metadata: {
          payerAccountId: transactionStatus.payerAccountId,
          payerName: transactionStatus.payerName,
          timestamp: transactionStatus.timestamp,
          md5Hash: finalMd5Hash?.substring(0, 8) + "...",
          hash: responseData?.hash,
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
          stack: error.stack,
        },
        "Failed to get Bakong transaction status"
      );

      // Handle specific error cases
      if (error.response?.status === 401) {
        // 401 Unauthorized - token expired or invalid
        // Return pending status instead of throwing error so payment checking can continue
        logger.warn(
          {
            transactionId,
            errorMessage: error.response.data?.responseMessage || "Unauthorized",
          },
          "Bakong API authentication failed - returning pending status"
        );

        // Return pending status so frontend can continue checking
        const transactionStatus: BakongTransactionStatus = {
          transactionId,
          status: "pending",
          amount: 0,
          currency: "USD" as BakongCurrency,
          timestamp: undefined,
          payerAccountId: undefined,
          payerName: undefined,
        };

        // Log status check event with auth error
        await logPaymentEvent({
          transactionId,
          paymentMethod: "bakong",
          eventType: "transaction_status_checked",
          status: "pending",
          amount: 0,
          currency: "USD",
          metadata: {
            authError: true,
            errorMessage: error.response.data?.responseMessage || "Unauthorized",
            responseCode: error.response.data?.responseCode,
          },
        });

        return transactionStatus;
      }

      if (error.response?.status === 404) {
        throw new AppError(
          "Transaction not found or not yet processed",
          httpStatus.NOT_FOUND
        );
      }
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            "Invalid request to Bakong API";
        throw new AppError(
          `Bakong API validation error: ${errorMessage}`,
          httpStatus.BAD_REQUEST
        );
      }

      if (error.response) {
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            error.response.statusText ||
                            "Unknown error from Bakong API";
        throw new AppError(
          `Bakong API error: ${errorMessage}`,
          error.response.status || httpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Re-throw AppError as-is
      if (error instanceof AppError) {
        throw error;
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
   * Create subscription payment
   */
  async createSubscriptionPayment(
    input: CreateBakongPaymentInput
  ): Promise<BakongPaymentResponse> {

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

// Re-export types for backward compatibility
export type {
  CreateBakongPaymentInput,
  BakongPaymentResponse,
  BakongTransactionStatus,
  BakongPaymentMetadata,
  BakongCurrency,
  MerchantInfo,
  IndividualMerchantInfo,
  SourceInfo,
  KHQRResponse,
  KHQRCurrencyData,
  MerchantType,
} from "@/types/bakong.types";
