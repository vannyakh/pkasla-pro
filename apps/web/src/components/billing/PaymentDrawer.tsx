import { useState } from "react";
import { CreditCard, Loader2, QrCode } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  useCreateBakongSubscriptionPayment,
  useCreateStripeSubscriptionPayment,
} from "@/hooks/api/usePayment";
import { StripeProvider } from "@/providers/StripeProvider";
import { StripePaymentForm } from "@/components/payments/StripePaymentForm";
import toast from "react-hot-toast";

interface PaymentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string | null;
  onPaymentComplete?: () => void;
}

export function PaymentDrawer({
  open,
  onOpenChange,
  planId,
  onPaymentComplete,
}: PaymentDrawerProps) {
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "bakong" | null>(null);
  const [paymentData, setPaymentData] = useState<{
    qrCode?: string;
    transactionId?: string;
    clientSecret?: string;
    paymentIntentId?: string;
    amount?: number;
    currency?: string;
  } | null>(null);

  const createBakongSubscriptionPaymentMutation = useCreateBakongSubscriptionPayment();
  const createStripeSubscriptionPaymentMutation = useCreateStripeSubscriptionPayment();

  const handleCreatePayment = async () => {
    if (!planId) return;

    try {
      if (paymentMethod === "bakong") {
        const payment = await createBakongSubscriptionPaymentMutation.mutateAsync({
          planId,
        });
        setPaymentData({
          qrCode: payment.qrCode,
          transactionId: payment.transactionId,
        });
        toast.success("Bakong QR code generated. Please scan to complete payment.");
      } else if (paymentMethod === "stripe") {
        const paymentIntent = await createStripeSubscriptionPaymentMutation.mutateAsync({
          planId,
        });
        setPaymentData({
          clientSecret: paymentIntent.clientSecret,
          paymentIntentId: paymentIntent.paymentIntentId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        });
        toast.success("Stripe payment initialized. Please complete payment.");
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleBack = () => {
    setPaymentData(null);
    setPaymentMethod(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setPaymentData(null);
      setPaymentMethod(null);
    }
    onOpenChange(open);
  };

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader>
          <DrawerTitle>Complete Payment</DrawerTitle>
          <DrawerDescription>
            Choose your payment method to complete the subscription
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-4">
          {!paymentData ? (
            <>
              <div>
                <p className="text-sm font-semibold text-black mb-3">Select Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bakong")}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      paymentMethod === "bakong"
                        ? "border-black bg-gray-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <QrCode className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm font-semibold text-black">Bakong</p>
                    <p className="text-xs text-gray-500 mt-1">KHQR</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stripe")}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      paymentMethod === "stripe"
                        ? "border-black bg-gray-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm font-semibold text-black">Stripe</p>
                    <p className="text-xs text-gray-500 mt-1">Credit Card</p>
                  </button>
                </div>
              </div>

              <Button
                onClick={handleCreatePayment}
                disabled={
                  !paymentMethod ||
                  createBakongSubscriptionPaymentMutation.isPending ||
                  createStripeSubscriptionPaymentMutation.isPending
                }
                className="w-full"
              >
                {createBakongSubscriptionPaymentMutation.isPending ||
                createStripeSubscriptionPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </>
          ) : paymentData.qrCode ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-sm font-semibold text-black mb-4">Scan QR Code to Pay</p>
                <div className="w-64 h-64 bg-white rounded-lg mb-4 flex items-center justify-center border border-gray-200 relative overflow-hidden">
                  <Image
                    src={paymentData.qrCode}
                    alt="Payment QR Code"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Payment will be verified automatically
                </p>
              </div>
              <Button variant="outline" onClick={handleBack} className="w-full">
                Back
              </Button>
            </div>
          ) : paymentData.clientSecret ? (
            <div className="space-y-4">
              <StripeProvider
                options={{
                  clientSecret: paymentData.clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <StripePaymentForm
                  clientSecret={paymentData.clientSecret}
                  paymentIntentId={paymentData.paymentIntentId || ''}
                  amount={paymentData.amount || 0}
                  currency={paymentData.currency || 'usd'}
                  onSuccess={() => {
                    toast.success('Payment successful! Subscription activated.');
                    onPaymentComplete?.();
                    handleClose(false);
                  }}
                  onCancel={handleBack}
                />
              </StripeProvider>
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

