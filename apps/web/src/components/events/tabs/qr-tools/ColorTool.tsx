"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette } from "lucide-react";
import { useQRCustomizationStore } from "@/store/qrCustomization";

export function ColorTool() {
  const qrFgColor = useQRCustomizationStore(
    (state) => state.customization.qrFgColor
  );
  const qrBgColor = useQRCustomizationStore(
    (state) => state.customization.qrBgColor
  );
  const setCustomization = useQRCustomizationStore(
    (state) => state.setCustomization
  );

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Palette className="h-3.5 w-3.5" />
        QR Code Colors
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qrFg" className="text-xs">
            Foreground
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="qrFg"
              type="color"
              value={qrFgColor}
              onChange={(e) =>
                setCustomization({ qrFgColor: e.target.value })
              }
              className="w-14 sm:w-16 h-9 shrink-0"
            />
            <Input
              type="text"
              value={qrFgColor}
              onChange={(e) =>
                setCustomization({ qrFgColor: e.target.value })
              }
              className="flex-1 h-9 text-xs"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="qrBg" className="text-xs">
            Background
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="qrBg"
              type="color"
              value={qrBgColor}
              onChange={(e) =>
                setCustomization({ qrBgColor: e.target.value })
              }
              className="w-14 sm:w-16 h-9 shrink-0"
            />
            <Input
              type="text"
              value={qrBgColor}
              onChange={(e) =>
                setCustomization({ qrBgColor: e.target.value })
              }
              className="flex-1 h-9 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

