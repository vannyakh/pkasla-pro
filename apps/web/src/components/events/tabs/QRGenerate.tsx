"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEvent, useGenerateEventQRToken } from "@/hooks/api/useEvent";
import {
  Download,
  Loader2,
  QrCode as QrCodeIcon,
  AlertCircle,
  RefreshCw,
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
  ToolbarPanel,
  ToolContentPanel,
  DraggableCanvas,
  ExportDrawer,
  type ToolType,
} from "./qr-tools";

interface QRGenerateProps {
  eventId: string;
}

/**
 * QRGenerate Component
 * Main QR code generator with Figma-style interface
 * Layout: Vertical Toolbar | Tool Panel | Canvas Preview
 */
export default function QRGenerate({ eventId }: QRGenerateProps) {
  // API Hooks
  const { data: event, isLoading, error, refetch } = useEvent(eventId);
  const generateQRTokenMutation = useGenerateEventQRToken();

  // Local State
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolType>("select");

  // Store State
  const customization = useQRCustomizationStore((state) => state.customization);
  const setCustomization = useQRCustomizationStore(
    (state) => state.setCustomization
  );

  // Initialize default text on mount
  useEffect(() => {
    if (event && !customization.titleText) {
      setCustomization({
        titleText: "Scan to Join",
        subtitleText: "Join our event",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  // Get site URL for QR code links
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

  // Build full QR code URL
  const getQRCodeUrl = (token: string) => {
    return `${siteUrl}/join/${token}`;
  };

  // Handlers
  const handleGenerateToken = async () => {
    try {
      await generateQRTokenMutation.mutateAsync(eventId);
      await refetch();
      toast.success("QR code generated successfully!");
    } catch {
      // Error is handled by mutation
    }
  };

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
    <Card className="border-0 shadow-none">
      <CardHeader className="px-4 py-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <QrCodeIcon className="h-5 w-5" />
            QR Generator
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={openExportDrawer}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateToken}
              disabled={generateQRTokenMutation.isPending}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${generateQRTokenMutation.isPending ? "animate-spin" : ""}`}
              />
              Regenerate
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex h-[calc(100vh-200px)] min-h-[600px]">
          {/* Vertical Icon Toolbar */}
          <ToolbarPanel
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
          />

          {/* Tool Content Panel */}
          <ToolContentPanel selectedTool={selectedTool} qrCodeUrl={qrCodeUrl} />

          {/* Canvas Preview Panel */}
          <div className="flex-1 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-6 py-3 border-b bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <h3 className="text-sm font-semibold">Live Preview</h3>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors">
                      <CircleQuestionMark className="h-4 w-4" />
                      Help
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold">
                        ReactFlow Canvas Controls:
                      </p>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>
                          <strong>Drag:</strong> Move elements around
                        </li>
                        <li>
                          <strong>Scroll:</strong> Zoom in/out
                        </li>
                        <li>
                          <strong>Pan:</strong> Click empty space and drag
                        </li>
                        <li>
                          <strong>Select:</strong> Click element to edit or
                          delete
                        </li>
                        <li>
                          <strong>Controls:</strong> Use bottom-right buttons
                        </li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex-1 flex items-center justify-center p-6">
                <DraggableCanvas qrCodeUrl={qrCodeUrl} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>

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
