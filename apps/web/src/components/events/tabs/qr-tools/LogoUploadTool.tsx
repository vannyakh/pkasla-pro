"use client";

import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQRCustomizationStore } from "@/store/qrCustomization";
import toast from "react-hot-toast";

export function LogoUploadTool() {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoImage = useQRCustomizationStore((state) => state.customization.logoImage);
  const setCustomization = useQRCustomizationStore((state) => state.setCustomization);

  const handleLogoUpload = useCallback(async (file: File) => {
    try {
      setUploadingLogo(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomization({ logoImage: result });
        toast.success("Logo uploaded!");
        setUploadingLogo(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read image");
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload logo");
      setUploadingLogo(false);
    }
  }, [setCustomization]);

  const triggerLogoUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleLogoUpload(file);
      }
    };
    input.click();
  }, [handleLogoUpload]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">Logo</Label>
      </div>
      <div className="flex items-center gap-2">
        {logoImage && (
          <div className="relative w-12 h-12 border rounded-lg overflow-hidden">
            <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
          </div>
        )}
        <div className="flex gap-2 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={triggerLogoUpload}
            disabled={uploadingLogo}
                className="flex-1"
          >
            {uploadingLogo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Upload logo (PNG, JPG up to 5MB)</p>
            </TooltipContent>
          </Tooltip>
          {logoImage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomization({ logoImage: undefined })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Remove logo</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}

