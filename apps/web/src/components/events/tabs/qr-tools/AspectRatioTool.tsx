"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useQRCustomizationStore, type AspectRatio } from "@/store/qrCustomization";
import { Check } from "lucide-react";

const ASPECT_RATIOS: { value: AspectRatio; label: string; description: string }[] = [
  { value: "1:1", label: "Square (1:1)", description: "Perfect for social media" },
  { value: "16:9", label: "Landscape (16:9)", description: "Wide format" },
  { value: "9:16", label: "Portrait (9:16)", description: "Mobile stories" },
  { value: "4:3", label: "Standard (4:3)", description: "Classic format" },
  { value: "3:4", label: "Portrait (3:4)", description: "Vertical content" },
  { value: "custom", label: "Custom", description: "Set your own size" },
];

export function AspectRatioTool() {
  const exportSettings = useQRCustomizationStore((state) => state.customization.exportSettings);
  const setAspectRatio = useQRCustomizationStore((state) => state.setAspectRatio);
  const setExportSettings = useQRCustomizationStore((state) => state.setExportSettings);

  if (!exportSettings) return null;

  const handleAspectRatioChange = (value: AspectRatio) => {
    setAspectRatio(value);
  };

  const handleCustomSizeChange = (dimension: "width" | "height", value: number) => {
    setExportSettings({
      [dimension]: value,
      aspectRatio: "custom",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Canvas Aspect Ratio</Label>
        <RadioGroup value={exportSettings.aspectRatio} onValueChange={handleAspectRatioChange}>
          <div className="grid grid-cols-2 gap-3">
            {ASPECT_RATIOS.map((ratio) => (
              <div key={ratio.value} className="relative">
                <RadioGroupItem
                  value={ratio.value}
                  id={ratio.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={ratio.value}
                  className="flex flex-col items-start gap-1 rounded-lg border-2 border-gray-200 p-3 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 transition-all"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm">{ratio.label}</span>
                    {exportSettings.aspectRatio === ratio.value && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{ratio.description}</span>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Custom Dimensions */}
      {exportSettings.aspectRatio === "custom" && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Custom Dimensions (px)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="canvas-width" className="text-xs">Width</Label>
              <Input
                id="canvas-width"
                type="number"
                value={exportSettings.width}
                onChange={(e) => handleCustomSizeChange("width", parseInt(e.target.value) || 1000)}
                min={100}
                max={5000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="canvas-height" className="text-xs">Height</Label>
              <Input
                id="canvas-height"
                type="number"
                value={exportSettings.height}
                onChange={(e) => handleCustomSizeChange("height", parseInt(e.target.value) || 1000)}
                min={100}
                max={5000}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

