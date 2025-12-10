"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Square, 
  RectangleHorizontal, 
  RectangleVertical,
  Smartphone,
  Monitor,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Maximize2
} from "lucide-react";
import { useQRCustomizationStore } from "@/store/qrCustomization";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FramePreset {
  name: string;
  platform: string;
  width: number;
  height: number;
  icon: React.ComponentType<{ className?: string }>;
  category: "social" | "print" | "custom";
  description?: string;
}

const FRAME_PRESETS: FramePreset[] = [
  // Instagram
  {
    name: "Instagram Post",
    platform: "Instagram",
    width: 1080,
    height: 1080,
    icon: Square,
    category: "social",
    description: "1:1 Square",
  },
  {
    name: "Instagram Story",
    platform: "Instagram",
    width: 1080,
    height: 1920,
    icon: Smartphone,
    category: "social",
    description: "9:16 Vertical",
  },
  {
    name: "Instagram Reel",
    platform: "Instagram",
    width: 1080,
    height: 1920,
    icon: Smartphone,
    category: "social",
    description: "9:16 Vertical",
  },
  // Facebook
  {
    name: "Facebook Post",
    platform: "Facebook",
    width: 1200,
    height: 630,
    icon: RectangleHorizontal,
    category: "social",
    description: "1.91:1",
  },
  {
    name: "Facebook Story",
    platform: "Facebook",
    width: 1080,
    height: 1920,
    icon: Smartphone,
    category: "social",
    description: "9:16 Vertical",
  },
  {
    name: "Facebook Cover",
    platform: "Facebook",
    width: 820,
    height: 312,
    icon: RectangleHorizontal,
    category: "social",
    description: "2.63:1",
  },
  // Twitter/X
  {
    name: "Twitter Post",
    platform: "Twitter",
    width: 1200,
    height: 675,
    icon: RectangleHorizontal,
    category: "social",
    description: "16:9",
  },
  {
    name: "Twitter Header",
    platform: "Twitter",
    width: 1500,
    height: 500,
    icon: RectangleHorizontal,
    category: "social",
    description: "3:1",
  },
  // LinkedIn
  {
    name: "LinkedIn Post",
    platform: "LinkedIn",
    width: 1200,
    height: 627,
    icon: RectangleHorizontal,
    category: "social",
    description: "1.91:1",
  },
  {
    name: "LinkedIn Cover",
    platform: "LinkedIn",
    width: 1584,
    height: 396,
    icon: RectangleHorizontal,
    category: "social",
    description: "4:1",
  },
  // YouTube
  {
    name: "YouTube Thumbnail",
    platform: "YouTube",
    width: 1280,
    height: 720,
    icon: RectangleHorizontal,
    category: "social",
    description: "16:9",
  },
  {
    name: "YouTube Banner",
    platform: "YouTube",
    width: 2560,
    height: 1440,
    icon: Monitor,
    category: "social",
    description: "16:9",
  },
  // TikTok
  {
    name: "TikTok Video",
    platform: "TikTok",
    width: 1080,
    height: 1920,
    icon: Smartphone,
    category: "social",
    description: "9:16 Vertical",
  },
  // Pinterest
  {
    name: "Pinterest Pin",
    platform: "Pinterest",
    width: 1000,
    height: 1500,
    icon: RectangleVertical,
    category: "social",
    description: "2:3 Vertical",
  },
  // Print Formats
  {
    name: "A4 Portrait",
    platform: "Print",
    width: 2480,
    height: 3508,
    icon: RectangleVertical,
    category: "print",
    description: "210×297mm",
  },
  {
    name: "A4 Landscape",
    platform: "Print",
    width: 3508,
    height: 2480,
    icon: RectangleHorizontal,
    category: "print",
    description: "297×210mm",
  },
  {
    name: "US Letter",
    platform: "Print",
    width: 2550,
    height: 3300,
    icon: RectangleVertical,
    category: "print",
    description: "8.5×11in",
  },
  {
    name: "Poster (24×36)",
    platform: "Print",
    width: 2400,
    height: 3600,
    icon: RectangleVertical,
    category: "print",
    description: "24×36in",
  },
];

export function FramePanel() {
  const setCustomization = useQRCustomizationStore((state) => state.setCustomization);
  const setExportSettings = useQRCustomizationStore((state) => state.setExportSettings);
  const customization = useQRCustomizationStore((state) => state.customization);
  const [customWidth, setCustomWidth] = React.useState(customization.canvasWidth);
  const [customHeight, setCustomHeight] = React.useState(customization.canvasHeight);
  const [showCustom, setShowCustom] = React.useState(false);

  const handlePresetClick = (preset: FramePreset) => {
    // Update both canvas and export settings
    setCustomization({
      canvasWidth: preset.width,
      canvasHeight: preset.height,
    });
    setExportSettings({
      width: preset.width,
      height: preset.height,
      aspectRatio: "custom",
    });
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    setCustomization({
      canvasWidth: customWidth,
      canvasHeight: customHeight,
    });
    setExportSettings({
      width: customWidth,
      height: customHeight,
      aspectRatio: "custom",
    });
  };

  const socialPresets = FRAME_PRESETS.filter((p) => p.category === "social");
  const printPresets = FRAME_PRESETS.filter((p) => p.category === "print");

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Maximize2 className="h-5 w-5 text-primary" />
            <Label className="text-sm font-semibold">Frame Presets</Label>
          </div>
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            {showCustom ? "Hide Custom" : "Custom Size"}
          </button>
        </div>

        {/* Custom Size Input */}
        {showCustom && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="custom-width" className="text-xs text-gray-600">
                  Width (px)
                </Label>
                <Input
                  id="custom-width"
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value) || 600)}
                  min={100}
                  max={5000}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="custom-height" className="text-xs text-gray-600">
                  Height (px)
                </Label>
                <Input
                  id="custom-height"
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value) || 800)}
                  min={100}
                  max={5000}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <button
              onClick={handleCustomApply}
              className="w-full py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Apply Custom Size
            </button>
          </div>
        )}

        {/* Current Size Display */}
        <div className="mt-3 p-2 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Current Size:</span>
            <span className="text-xs font-mono font-semibold text-primary">
              {customization.canvasWidth} × {customization.canvasHeight}px
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Social Media Presets */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-gray-600" />
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Social Media
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {socialPresets.map((preset, index) => {
                const Icon = preset.icon;
                const isActive =
                  customization.canvasWidth === preset.width &&
                  customization.canvasHeight === preset.height;
                
                return (
                  <button
                    key={index}
                    onClick={() => handlePresetClick(preset)}
                    className={`p-3 rounded-lg border-2 transition-all text-left hover:border-primary/50 ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-md ${
                          isActive ? "bg-primary/10" : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? "text-primary" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                isActive ? "text-primary" : "text-gray-900"
                              }`}
                            >
                              {preset.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {preset.description}
                            </p>
                          </div>
                          {isActive && (
                            <div className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1" />
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-gray-400 mt-1">
                          {preset.width} × {preset.height}px
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Print Presets */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-gray-600" />
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Print Formats
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {printPresets.map((preset, index) => {
                const Icon = preset.icon;
                const isActive =
                  customization.canvasWidth === preset.width &&
                  customization.canvasHeight === preset.height;

                return (
                  <button
                    key={index}
                    onClick={() => handlePresetClick(preset)}
                    className={`p-3 rounded-lg border-2 transition-all text-left hover:border-primary/50 ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-md ${
                          isActive ? "bg-primary/10" : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? "text-primary" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                isActive ? "text-primary" : "text-gray-900"
                              }`}
                            >
                              {preset.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {preset.description}
                            </p>
                          </div>
                          {isActive && (
                            <div className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1" />
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-gray-400 mt-1">
                          {preset.width} × {preset.height}px
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

