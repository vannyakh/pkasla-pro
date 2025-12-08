"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Type } from "lucide-react";
import { useQRCustomizationStore } from "@/store/qrCustomization";

export function TextTool() {
  const titleText = useQRCustomizationStore(
    (state) => state.customization.titleText
  );
  const subtitleText = useQRCustomizationStore(
    (state) => state.customization.subtitleText
  );
  const showEventDetails = useQRCustomizationStore(
    (state) => state.customization.showEventDetails
  );
  const setCustomization = useQRCustomizationStore(
    (state) => state.setCustomization
  );

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Type className="h-3.5 w-3.5" />
        Custom Text
      </Label>
      <div className="space-y-3">
        <div>
          <Label htmlFor="titleText" className="text-xs">
            Title
          </Label>
          <Input
            id="titleText"
            value={titleText}
            onChange={(e) =>
              setCustomization({ titleText: e.target.value })
            }
            placeholder="Scan to Join"
          />
        </div>
        <div>
          <Label htmlFor="subtitleText" className="text-xs">
            Subtitle
          </Label>
          <Input
            id="subtitleText"
            value={subtitleText}
            onChange={(e) =>
              setCustomization({ subtitleText: e.target.value })
            }
            placeholder="Join our event"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showDetails"
            checked={showEventDetails}
            onChange={(e) =>
              setCustomization({ showEventDetails: e.target.checked })
            }
            className="rounded"
          />
          <Label htmlFor="showDetails" className="text-xs cursor-pointer">
            Show event details
          </Label>
        </div>
      </div>
    </div>
  );
}

