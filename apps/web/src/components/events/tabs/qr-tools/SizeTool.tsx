"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQRCustomizationStore } from "@/store/qrCustomization";

export function SizeTool() {
  const qrSize = useQRCustomizationStore((state) => state.customization.qrSize);
  const setCustomization = useQRCustomizationStore(
    (state) => state.setCustomization
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="qrSize" className="text-sm font-medium">
        QR Code Size: {qrSize}px
      </Label>
      <Input
        id="qrSize"
        type="range"
        min="200"
        max="400"
        step="20"
        value={qrSize}
        onChange={(e) =>
          setCustomization({ qrSize: parseInt(e.target.value) })
        }
      />
    </div>
  );
}

