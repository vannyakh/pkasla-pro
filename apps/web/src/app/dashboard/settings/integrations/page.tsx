"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, Link as LinkIcon, CheckCircle, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConnectTelegram, useDisconnectTelegram, useTelegramBotStatus } from "@/hooks/api";
import toast from "react-hot-toast";

export default function IntegrationsPage() {
  const { data: session } = useSession();
  const [telegramChatId, setTelegramChatId] = useState("");
  const [showReconnect, setShowReconnect] = useState(false);

  const connectTelegramMutation = useConnectTelegram();
  const disconnectTelegramMutation = useDisconnectTelegram();
  
  // Fetch Telegram bot status
  const { data: botStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useTelegramBotStatus(!!session?.user);

  // Derive connection state from bot status or session data
  const isConnected = botStatus?.isConnected ?? !!session?.user?.telegramChatId;
  const sessionChatId = botStatus?.telegramChatId || session?.user?.telegramChatId || "";

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!telegramChatId.trim()) {
      toast.error("Please enter your Telegram Chat ID");
      return;
    }

    try {
      await connectTelegramMutation.mutateAsync({
        telegramChatId: telegramChatId.trim(),
        isTelegramBot: true,
      });
      setShowReconnect(false);
      await refetchStatus();
    } catch (error) {
      // Error is already handled by the mutation
      console.error(error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectTelegramMutation.mutateAsync();
      setTelegramChatId("");
      setShowReconnect(false);
      await refetchStatus();
    } catch (error) {
      // Error is already handled by the mutation
      console.error(error);
    }
  };

  const handleReconnect = () => {
    setShowReconnect(true);
    setTelegramChatId("");
  };

  const handleCancelReconnect = () => {
    setShowReconnect(false);
    setTelegramChatId("");
  };

  const handleCheckStatus = async () => {
    await refetchStatus();
    toast.success("Status refreshed!");
  };

  const copyBotUsername = () => {
    navigator.clipboard.writeText("@phkasla_bot");
    toast.success("Bot username copied!");
  };

  return (
    <div className="gap-6 max-w-2xl">
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Telegram Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Alert */}
          {isConnected && !showReconnect && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your Telegram account is connected. You will receive notifications at chat ID: <strong>{sessionChatId}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          {(!isConnected || showReconnect) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-sm text-blue-900">
              How to get your Chat ID:
            </h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>
                Open Telegram and search for{" "}
                <button
                  onClick={copyBotUsername}
                  className="inline-flex items-center gap-1 font-mono bg-blue-100 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors"
                >
                  @phkasla_bot
                  <Copy className="h-3 w-3" />
                </button>
              </li>
              <li>Start a conversation with the bot by clicking &quot;Start&quot;</li>
              <li>Send the command <code className="bg-blue-100 px-1.5 py-0.5 rounded">/start</code></li>
              <li>The bot will reply with your Chat ID</li>
              <li>Copy the Chat ID and paste it below</li>
            </ol>
          </div>
          )}

          {/* Connection Form */}
          <form onSubmit={handleConnect} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="chatId"
                className="text-sm font-medium text-gray-700"
              >
                Telegram Chat ID
              </Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="chatId"
                  name="chatId"
                  type="text"
                  value={(isConnected && !showReconnect) ? sessionChatId : telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="pl-10 h-11 text-sm border-gray-300"
                  placeholder="Enter your Telegram Chat ID"
                  required
                  disabled={(isConnected && !showReconnect) || connectTelegramMutation.isPending}
                />
              </div>
              {isConnected && !showReconnect && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Connected to Telegram</span>
                </div>
              )}
            </div>

            {(!isConnected || showReconnect) ? (
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={connectTelegramMutation.isPending}
                  className="w-full h-11 text-sm font-medium disabled:opacity-50"
                >
                  {connectTelegramMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {showReconnect ? "Reconnecting..." : "Connecting..."}
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      {showReconnect ? "Reconnect Telegram" : "Connect Telegram"}
                    </>
                  )}
                </Button>
                {showReconnect && (
                  <Button
                    type="button"
                    onClick={handleCancelReconnect}
                    variant="outline"
                    className="w-full h-11 text-sm font-medium"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={handleReconnect}
                    variant="outline"
                    className="h-11 text-sm font-medium"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reconnect
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCheckStatus}
                    variant="outline"
                    disabled={isLoadingStatus}
                    className="h-11 text-sm font-medium"
                  >
                    {isLoadingStatus ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Check Status
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnectTelegramMutation.isPending}
                  variant="destructive"
                  className="w-full h-11 text-sm font-medium disabled:opacity-50"
                >
                  {disconnectTelegramMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Disconnecting...
                    </>
                  ) : (
                    "Disconnect Telegram"
                  )}
                </Button>
              </div>
            )}
          </form>

          {/* Features */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-sm text-gray-900 mb-3">
              What you can do with Telegram integration:
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Receive notifications directly in Telegram</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Get instant updates about your account</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Quick access to important information</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
