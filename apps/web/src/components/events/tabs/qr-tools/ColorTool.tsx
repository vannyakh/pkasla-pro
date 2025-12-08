"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQRCustomizationStore } from "@/store/qrCustomization";

export function ColorTool() {
  const qrFgColor = useQRCustomizationStore((state) => state.customization.qrFgColor);
  const qrBgColor = useQRCustomizationStore((state) => state.customization.qrBgColor);
  const setCustomization = useQRCustomizationStore((state) => state.setCustomization);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help">
              <Palette className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium cursor-help">Colors</Label>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Customize QR code foreground and background colors</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
            <Input
              type="color"
              value={qrFgColor}
                onChange={(e) => setCustomization({ qrFgColor: e.target.value })}
                className="w-10 h-10 p-1 cursor-pointer"
                title="Foreground"
            />
              <span className="text-xs text-muted-foreground">FG</span>
          </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Foreground: {qrFgColor}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
            <Input
              type="color"
              value={qrBgColor}
                onChange={(e) => setCustomization({ qrBgColor: e.target.value })}
                className="w-10 h-10 p-1 cursor-pointer"
                title="Background"
            />
              <span className="text-xs text-muted-foreground">BG</span>
          </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Background: {qrBgColor}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

