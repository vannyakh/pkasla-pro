"use client";

import React from "react";
import { ToolType } from "./ToolbarPanel";
import { DesignPanel } from "./DesignPanel";
import { ContentPanel } from "./ContentPanel";
import { PropertyPanel } from "./PropertyPanel";
import { CanvasPanel } from "./CanvasPanel";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QrCode, Image, X } from "lucide-react";
import { useQRCustomizationStore } from "@/store/qrCustomization";

interface ToolContentPanelProps {
  selectedTool: ToolType;
  qrCodeUrl: string;
  onClose?: () => void;
}

export function ToolContentPanel({
  selectedTool,
  qrCodeUrl,
  onClose,
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

  const handleAddText = () => {
    const textCount = elements.filter((el) =>
      ["title", "subtitle", "eventDetails"].includes(el.type)
    ).length;
    addElement({
      type: "subtitle",
      x: 100 + textCount * 20,
      y: 100 + textCount * 20,
      visible: true,
      locked: false,
      zIndex: elements.length + 1,
      text: "New Text",
      fontSize: 16,
      color: "#1f2937",
    });
  };

  const renderContent = () => {
    switch (selectedTool) {
      case "qr":
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <Label className="text-sm font-semibold">QR Code Tools</Label>
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button onClick={handleAddQR} className="w-full" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              Add QR Code
            </Button>
            <ContentPanel qrCodeUrl={qrCodeUrl} />
          </div>
        );

      case "text":
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold">Text Tools</Label>
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button onClick={handleAddText} className="w-full" size="sm">
              Add Text
            </Button>
            <ContentPanel qrCodeUrl={qrCodeUrl} />
          </div>
        );

      case "image":
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                <Label className="text-sm font-semibold">Image Tools</Label>
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <ContentPanel qrCodeUrl={qrCodeUrl} />
          </div>
        );

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
  
  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      {content || (
        <div className="p-4 text-center text-sm text-gray-500">
          Select a tool to get started
        </div>
      )}
    </div>
  );
}

