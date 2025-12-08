"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SizeTool } from "./SizeTool";
import { AspectRatioTool } from "./AspectRatioTool";
import { Maximize } from "lucide-react";

export function CanvasPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Maximize className="h-4 w-4 text-primary" />
        <Label className="text-sm font-semibold">Canvas & QR Size</Label>
      </div>
      
      <div className="space-y-4">
        <SizeTool />
        
        <Separator />
        
        <AspectRatioTool />
      </div>
    </div>
  );
}

