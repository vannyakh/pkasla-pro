"use client";

import React from "react";
import { ToolType } from "./ToolbarPanel";
import { DesignPanel } from "./DesignPanel";
import { ContentPanel } from "./ContentPanel";
import { PropertyPanel } from "./PropertyPanel";
import { CanvasPanel } from "./CanvasPanel";
import { MediaPanel } from "./MediaPanel";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { useQRCustomizationStore } from "@/store/qrCustomization";

interface ToolContentPanelProps {
  selectedTool: ToolType;
  qrCodeUrl: string;
}

export function ToolContentPanel({
  selectedTool,
  qrCodeUrl,
}: ToolContentPanelProps) {
  const addElement = useQRCustomizationStore((state) => state.addElement);
  const elements = useQRCustomizationStore((state) => state.customization.elements);

  const handleAddQR = () => {
    const qrCount = elements.filter((el) => el.type === "qr").length;
    addElement({
      type: "qr",
      x: 100 + qrCount * 20,
      y: 100 + qrCount * 20,
      width: 280,
      height: 280,
      visible: true,
      locked: false,
      zIndex: elements.length + 1,
    });
  };

  const renderContent = () => {
    switch (selectedTool) {
      // Cursor-only tools - no panel needed
      case "select":
      case "move":
      case "text":
        return null;

      case "qr":
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <Label className="text-sm font-semibold">QR Code Tools</Label>
            </div>
            <Button onClick={handleAddQR} className="w-full" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              Add QR Code
            </Button>
            <ContentPanel qrCodeUrl={qrCodeUrl} />
          </div>
        );

      case "image":
        return <MediaPanel />;

      case "layers":
        return <PropertyPanel />;

      case "design":
        return (
          <div className="p-4 space-y-4">
            <DesignPanel />
          </div>
        );

      case "settings":
        return (
          <div className="p-4">
            <CanvasPanel />
          </div>
        );

      default:
        return null;
    }
  };

  const content = renderContent();
  
  // Hide panel for cursor-only tools
  if (content === null) {
    return null;
  }
  
  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      {content}
    </div>
  );
}

