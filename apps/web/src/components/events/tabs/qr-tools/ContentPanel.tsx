"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TextTool } from "./TextTool";
import { LogoUploadTool } from "./LogoUploadTool";
import { Type } from "lucide-react";
import toast from "react-hot-toast";

interface ContentPanelProps {
  qrCodeUrl: string;
}

export function ContentPanel({ qrCodeUrl }: ContentPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-primary" />
        <Label className="text-sm font-semibold">Content</Label>
      </div>
      
      <div className="space-y-4">
        <TextTool />
        
        <Separator />
        
        <LogoUploadTool />
        
        <Separator />
        
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500">QR Code URL</Label>
          <div className="text-xs text-gray-700 break-all bg-gray-50 p-2 rounded border">
            {qrCodeUrl}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText(qrCodeUrl);
              toast.success("URL copied to clipboard!");
            }}
          >
            Copy URL
          </Button>
        </div>
      </div>
    </div>
  );
}

