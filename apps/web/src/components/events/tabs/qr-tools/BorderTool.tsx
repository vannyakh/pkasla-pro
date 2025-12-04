"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQRCustomizationStore } from "@/store/qrCustomization";

export function BorderTool() {
  const customBorderColor = useQRCustomizationStore(
    (state) => state.customization.customBorderColor
  );
  const setCustomization = useQRCustomizationStore(
    (state) => state.setCustomization
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="customBorder" className="text-sm font-medium">
        Custom Border Color (optional)
      </Label>
      <div className="flex gap-2">
        <Input
          id="customBorder"
          type="color"
          value={customBorderColor || "#e5e7eb"}
          onChange={(e) =>
            setCustomization({ customBorderColor: e.target.value })
          }
          className="w-16 sm:w-20 h-9 shrink-0"
        />
        {customBorderColor && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomization({ customBorderColor: undefined })}
            className="flex-1 sm:flex-initial"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

