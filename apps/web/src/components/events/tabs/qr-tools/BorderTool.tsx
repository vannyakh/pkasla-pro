"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircleDot, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQRCustomizationStore } from "@/store/qrCustomization";

export function BorderTool() {
  const customBorderColor = useQRCustomizationStore((state) => state.customization.customBorderColor);
  const setCustomization = useQRCustomizationStore((state) => state.setCustomization);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help">
              <CircleDot className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium cursor-help">Border</Label>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Custom border color (optional)</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={customBorderColor || "#e5e7eb"}
          onChange={(e) => setCustomization({ customBorderColor: e.target.value })}
          className="w-10 h-10 p-1 cursor-pointer"
        />
        {customBorderColor && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCustomization({ customBorderColor: undefined })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

