"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Type, Heading, FileText, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQRCustomizationStore } from "@/store/qrCustomization";

export function TextTool() {
  const titleText = useQRCustomizationStore((state) => state.customization.titleText);
  const subtitleText = useQRCustomizationStore((state) => state.customization.subtitleText);
  const showEventDetails = useQRCustomizationStore((state) => state.customization.showEventDetails);
  const setCustomization = useQRCustomizationStore((state) => state.setCustomization);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">Text</Label>
      </div>
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Heading className="h-3.5 w-3.5 text-muted-foreground" />
            <Label htmlFor="titleText" className="text-xs">Title</Label>
          </div>
          <Input
            id="titleText"
            value={titleText}
            onChange={(e) => setCustomization({ titleText: e.target.value })}
            placeholder="Scan to Join"
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <Label htmlFor="subtitleText" className="text-xs">Subtitle</Label>
          </div>
          <Input
            id="subtitleText"
            value={subtitleText}
            onChange={(e) => setCustomization({ subtitleText: e.target.value })}
            placeholder="Join our event"
            className="h-9"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <Label htmlFor="showDetails" className="text-xs cursor-pointer">
              Event Details
            </Label>
          </div>
          <Switch
            id="showDetails"
            checked={showEventDetails}
            onCheckedChange={(checked) => setCustomization({ showEventDetails: checked })}
          />
        </div>
      </div>
    </div>
  );
}

