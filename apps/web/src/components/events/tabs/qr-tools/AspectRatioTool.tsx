"use client";

import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Square, 
  RectangleHorizontal, 
  RectangleVertical,
  Maximize,
  Ratio 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQRCustomizationStore, type AspectRatio } from "@/store/qrCustomization";

const ASPECT_RATIOS: { 
  value: AspectRatio; 
  label: string; 
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "1:1", label: "1:1", icon: Square },
  { value: "16:9", label: "16:9", icon: RectangleHorizontal },
  { value: "9:16", label: "9:16", icon: RectangleVertical },
  { value: "4:3", label: "4:3", icon: RectangleHorizontal },
  { value: "3:4", label: "3:4", icon: RectangleVertical },
  { value: "custom", label: "Custom", icon: Maximize },
];

export function AspectRatioTool() {
  const exportSettings = useQRCustomizationStore((state) => state.customization.exportSettings);
  const setAspectRatio = useQRCustomizationStore((state) => state.setAspectRatio);
  const setExportSettings = useQRCustomizationStore((state) => state.setExportSettings);

  const handleCustomSizeChange = useCallback((dimension: "width" | "height", value: number) => {
    setExportSettings({
      [dimension]: value,
      aspectRatio: "custom",
    });
  }, [setExportSettings]);

  if (!exportSettings) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Ratio className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">Ratio</Label>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {ASPECT_RATIOS.map((ratio) => {
          const Icon = ratio.icon;
          return (
            <Tooltip key={ratio.value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    exportSettings.aspectRatio === ratio.value
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${
                    exportSettings.aspectRatio === ratio.value ? "text-primary" : "text-gray-600"
                  }`} />
                  <span className="text-[10px] font-medium">{ratio.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Aspect ratio {ratio.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Custom Dimensions */}
      {exportSettings.aspectRatio === "custom" && (
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="space-y-1">
            <Label htmlFor="canvas-width" className="text-xs">W</Label>
              <Input
                id="canvas-width"
                type="number"
                value={exportSettings.width}
                onChange={(e) => handleCustomSizeChange("width", parseInt(e.target.value) || 1000)}
                min={100}
                max={5000}
              className="h-8 text-xs"
              />
            </div>
          <div className="space-y-1">
            <Label htmlFor="canvas-height" className="text-xs">H</Label>
              <Input
                id="canvas-height"
                type="number"
                value={exportSettings.height}
                onChange={(e) => handleCustomSizeChange("height", parseInt(e.target.value) || 1000)}
                min={100}
                max={5000}
              className="h-8 text-xs"
              />
          </div>
        </div>
      )}
    </div>
  );
}

