"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Maximize2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQRCustomizationStore } from "@/store/qrCustomization";

export function SizeTool() {
  const qrSize = useQRCustomizationStore((state) => state.customization.qrSize);
  const setCustomization = useQRCustomizationStore((state) => state.setCustomization);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help">
              <Maximize2 className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium cursor-help">Size</Label>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Adjust QR code dimensions</p>
          </TooltipContent>
        </Tooltip>
        <span className="text-xs font-mono text-muted-foreground">{qrSize}px</span>
      </div>
      <Input
        type="range"
        min="200"
        max="400"
        step="20"
        value={qrSize}
        onChange={(e) => setCustomization({ qrSize: parseInt(e.target.value) })}
        className="cursor-pointer"
      />
    </div>
  );
}

