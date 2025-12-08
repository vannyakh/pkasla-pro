"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useEvent, useGenerateEventQRToken } from "@/hooks/api/useEvent";
import {
  Download,
  Loader2,
  QrCode as QrCodeIcon,
  AlertCircle,
  RefreshCw,
  Palette,
  CircleQuestionMark,
} from "lucide-react";
import { env } from "@/config/env";
import toast from "react-hot-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQRCustomizationStore } from "@/store/qrCustomization";
import {
  FrameStyleTool,
  ColorTool,
  SizeTool,
  LogoUploadTool,
  TextTool,
  BorderTool,
  AspectRatioTool,
  DraggableCanvas,
  ExportDrawer,
} from "./qr-tools";

interface QRGenerateProps {
  eventId: string;
}

export default function QRGenerate({ eventId }: QRGenerateProps) {
  const { data: event, isLoading, error, refetch } = useEvent(eventId);
  const generateQRTokenMutation = useGenerateEventQRToken();
  const [isMobile, setIsMobile] = React.useState(false);
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);

  // Get store data
  const customization = useQRCustomizationStore((state) => state.customization);
  const setCustomization = useQRCustomizationStore(
    (state) => state.setCustomization
  );

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync customization with local state on mount
  useEffect(() => {
    if (event && !customization.titleText) {
      setCustomization({
        titleText: "Scan to Join",
        subtitleText: "Join our event",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  // Get site URL for building QR code URL
  const siteUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return (
        process.env.NEXT_PUBLIC_SITE_URL ||
        env.nextAuthUrl ||
        window.location.origin
      );
    }
    return (
      process.env.NEXT_PUBLIC_SITE_URL ||
      env.nextAuthUrl ||
      "https://example.com"
    );
  }, []);

  // Generate QR code URL for event
  const getQRCodeUrl = (token: string) => {
    return `${siteUrl}/join/${token}`;
  };

  // Generate QR code token if not exists
  const handleGenerateToken = async () => {
    try {
      await generateQRTokenMutation.mutateAsync(eventId);
      await refetch();
      toast.success("QR code generated successfully!");
    } catch {
      // Error is handled by mutation
    }
  };

  // Open export drawer
  const openExportDrawer = () => {
    if (!event?.qrCodeToken) {
      toast.error("QR code not found");
      return;
    }
    setExportDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">
            បង្កើតQR (Generate QR)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">
            បង្កើតQR (Generate QR)
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-sm text-red-600">
            {error.message || "Failed to load event"}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!event) {
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">
            បង្កើតQR (Generate QR)
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-sm text-gray-600">
            Event not found
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!event.qrCodeToken) {
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">
            បង្កើតQR (Generate QR)
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-gray-400" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                No QR code generated yet
              </p>
              <p className="text-sm text-gray-600">
                Generate a QR code for guests to scan and join this event
              </p>
            </div>
            <Button
              onClick={handleGenerateToken}
              disabled={generateQRTokenMutation.isPending}
              className="gap-2"
            >
              {generateQRTokenMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCodeIcon className="h-4 w-4" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const qrCodeUrl = getQRCodeUrl(event.qrCodeToken);

  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <CardTitle className="text-base sm:text-lg font-semibold text-black">
            បង្កើតQR (Generate QR)
          </CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={openExportDrawer}
              className="gap-2 flex-1 sm:flex-initial"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateToken}
              disabled={generateQRTokenMutation.isPending}
              className="gap-2 flex-1 sm:flex-initial"
            >
              <RefreshCw
                className={`h-4 w-4 ${generateQRTokenMutation.isPending ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <ResizablePanelGroup
          direction={isMobile ? "vertical" : "horizontal"}
          className="min-h-[400px] sm:min-h-[600px] rounded-lg border"
        >
          {/* Tool Panel */}
          <ResizablePanel
            defaultSize={isMobile ? 50 : 40}
            minSize={isMobile ? 40 : 30}
          >
            <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Customize QR Code
                </h3>

                {/* Frame Style */}
                <FrameStyleTool />

                {/* QR Colors */}
                <ColorTool />

                {/* QR Size */}
                <SizeTool />

                {/* Canvas Aspect Ratio */}
                <AspectRatioTool />

                {/* Logo Upload */}
                <LogoUploadTool />

                {/* Text Customization */}
                <TextTool />

                {/* Custom Border Color */}
                <BorderTool />

                {/* URL Info */}
                <div className="pt-4 border-t">
                  <Label className="text-xs text-gray-500 mb-2 block">
                    Join URL:
                  </Label>
                  <div className="text-xs text-gray-700 break-all bg-gray-50 p-2 rounded border mb-2">
                    {qrCodeUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(qrCodeUrl);
                      toast.success("Join URL copied to clipboard!");
                    }}
                  >
                    Copy URL
                  </Button>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel with Draggable Canvas */}
          <ResizablePanel defaultSize={isMobile ? 50 : 60}>
            <div className="h-full overflow-y-auto p-3 sm:p-6 bg-gray-50">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h3 className="text-base font-semibold">Live Preview</h3>
                  <div className="flex gap-2 items-center">
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Drag elements to reposition
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CircleQuestionMark className="h-4 w-4 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-lg">
                        <p className="text-xs">
                          <strong>How it works:</strong> When guests scan this
                          QR code, they will be taken to a page where they can
                          enter their name and contact information to join your
                          event. They will automatically be added as a confirmed
                          guest.
                          <br />
                          <br />
                          <strong>Drag & Drop:</strong> Click and drag elements
                          on the canvas to reposition them. Select an element to
                          delete it.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex items-center justify-center min-h-[300px] sm:min-h-[500px]">
                  <DraggableCanvas qrCodeUrl={qrCodeUrl} event={event} />
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </CardContent>

      {/* Export Drawer */}
      <ExportDrawer
        open={exportDrawerOpen}
        onOpenChange={setExportDrawerOpen}
        qrElement={
          typeof document !== "undefined"
            ? document.getElementById("qr-preview-card")
            : null
        }
        eventTitle={event.title}
      />
    </Card>
  );
}
