"use client";

import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQRCustomizationStore } from "@/store/qrCustomization";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

interface ExportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrElement: HTMLElement | null;
  eventTitle?: string;
}

const SCALE_OPTIONS = [
  { value: 1, label: "1x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
  { value: 2.5, label: "2.5x" },
  { value: 3, label: "3x" },
  { value: 4, label: "4x" },
];

const EXPORT_FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
];

export function ExportDrawer({ open, onOpenChange, qrElement, eventTitle }: ExportDrawerProps) {
  const exportSettings = useQRCustomizationStore((state) => state.customization.exportSettings);
  const setExportSettings = useQRCustomizationStore((state) => state.setExportSettings);
  const setCustomization = useQRCustomizationStore((state) => state.setCustomization);

  const [isExporting, setIsExporting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize export settings if undefined (for backward compatibility)
  useEffect(() => {
    if (!exportSettings) {
      setCustomization({
        exportSettings: {
          aspectRatio: "1:1",
          width: 1000,
          height: 1000,
          format: "png",
          quality: 95,
          scale: 2,
        },
      });
    }
  }, [exportSettings, setCustomization]);

  // Generate preview when settings change
  useEffect(() => {
    if (open && qrElement && exportSettings) {
      generatePreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, exportSettings?.aspectRatio, exportSettings?.width, exportSettings?.height, exportSettings?.scale]);

  const generatePreview = async () => {
    if (!qrElement || !exportSettings) return;

    setIsGeneratingPreview(true);
    try {
      // Clone the element
      const clonedElement = qrElement.cloneNode(true) as HTMLElement;
      clonedElement.style.position = "absolute";
      clonedElement.style.left = "-9999px";
      clonedElement.style.top = "-9999px";
      clonedElement.style.width = `${exportSettings.width}px`;
      clonedElement.style.height = `${exportSettings.height}px`;
      document.body.appendChild(clonedElement);

      // Fix color issues
      const allElements = clonedElement.querySelectorAll("*");
      allElements.forEach((el) => {
        const element = el as HTMLElement;
        const computedStyle = window.getComputedStyle(element);

        const colorProps = ["color", "backgroundColor", "borderColor", "fill", "stroke"];
        colorProps.forEach((prop) => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value.includes("lab(")) {
            element.style.setProperty(prop, "inherit", "important");
          }
        });
      });

      const canvas = await html2canvas(clonedElement, {
        scale: 1, // Lower scale for preview
        width: exportSettings.width,
        height: exportSettings.height,
        useCORS: true,
        backgroundColor: exportSettings.format === "png" ? null : "#ffffff",
        logging: false,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const clonedQR = clonedDoc.querySelector('[id="qr-preview-card"]');
          if (clonedQR) {
            const textElements = clonedQR.querySelectorAll("h3, p, div");
            textElements.forEach((el) => {
              const element = el as HTMLElement;
              const computedColor = window.getComputedStyle(element).color;
              if (computedColor && !computedColor.includes("lab(")) {
                element.style.color = computedColor;
              }
            });
          }
        },
      });

      document.body.removeChild(clonedElement);

      // Create preview URL
      const previewDataUrl = canvas.toDataURL("image/png", 0.8);
      setPreviewUrl(previewDataUrl);
      previewCanvasRef.current = canvas;
    } catch (error) {
      console.error("Failed to generate preview:", error);
      toast.error("Failed to generate preview");
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleExport = async () => {
    if (!qrElement) {
      toast.error("QR preview not found");
      return;
    }

    if (!exportSettings) {
      toast.error("Export settings not initialized");
      return;
    }

    setIsExporting(true);
    try {
      // Clone the element with export dimensions
      const clonedElement = qrElement.cloneNode(true) as HTMLElement;
      clonedElement.style.position = "absolute";
      clonedElement.style.left = "-9999px";
      clonedElement.style.top = "-9999px";
      clonedElement.style.width = `${exportSettings.width}px`;
      clonedElement.style.height = `${exportSettings.height}px`;
      document.body.appendChild(clonedElement);

      // Fix color issues
      const allElements = clonedElement.querySelectorAll("*");
      allElements.forEach((el) => {
        const element = el as HTMLElement;
        const computedStyle = window.getComputedStyle(element);

        const colorProps = ["color", "backgroundColor", "borderColor", "fill", "stroke"];
        colorProps.forEach((prop) => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value.includes("lab(")) {
            element.style.setProperty(prop, "inherit", "important");
          }
        });
      });

      const canvas = await html2canvas(clonedElement, {
        scale: exportSettings.scale,
        width: exportSettings.width,
        height: exportSettings.height,
        useCORS: true,
        backgroundColor: exportSettings.format === "png" ? null : "#ffffff",
        logging: false,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const clonedQR = clonedDoc.querySelector('[id="qr-preview-card"]');
          if (clonedQR) {
            const textElements = clonedQR.querySelectorAll("h3, p, div");
            textElements.forEach((el) => {
              const element = el as HTMLElement;
              const computedColor = window.getComputedStyle(element).color;
              if (computedColor && !computedColor.includes("lab(")) {
                element.style.color = computedColor;
              }
            });
          }
        },
      });

      document.body.removeChild(clonedElement);

      // Export based on format
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `qr-code-${eventTitle?.replace(/\s+/g, "-") || "export"}-${Date.now()}.${exportSettings.format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
            toast.success("QR code exported successfully!");
            onOpenChange(false);
          }
        },
        exportSettings.format === "png" ? "image/png" : "image/jpeg",
        exportSettings.quality / 100
      );
    } catch (error) {
      console.error("Failed to export QR code:", error);
      toast.error("Failed to export QR code. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };


  // Show loading if export settings not initialized
  if (!exportSettings) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-6">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-semibold">Export</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Scale and Format Row */}
          <div className="flex gap-3">
            <Select
              value={exportSettings.scale.toString()}
              onValueChange={(value) => setExportSettings({ scale: parseFloat(value) })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCALE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={exportSettings.format}
              onValueChange={(value: "png" | "jpg") => setExportSettings({ format: value })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || !previewUrl}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              <>
                Export {eventTitle ? eventTitle.substring(0, 20) : "QR code"}
                {eventTitle && eventTitle.length > 20 ? "..." : ""}
              </>
            )}
          </Button>

          {/* Collapsible Preview */}
          <div className="space-y-2">
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-gray-700 transition-colors"
            >
              <span>Preview</span>
              {isPreviewOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {isPreviewOpen && (
              <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-[300px] transition-all">
                {isGeneratingPreview ? (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">Generating preview...</p>
                  </div>
                ) : previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Export Preview"
                    width={exportSettings.width}
                    height={exportSettings.height}
                    className="max-w-full max-h-[400px] object-contain"
                    style={{
                      aspectRatio: `${exportSettings.width} / ${exportSettings.height}`,
                    }}
                    unoptimized
                  />
                ) : (
                  <p className="text-sm text-gray-500">No preview available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

