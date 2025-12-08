"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { useQRCustomizationStore } from "@/store/qrCustomization";
import toast from "react-hot-toast";

export function LogoUploadTool() {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoImage = useQRCustomizationStore(
    (state) => state.customization.logoImage
  );
  const setCustomization = useQRCustomizationStore(
    (state) => state.setCustomization
  );

  const handleLogoUpload = async (file: File) => {
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
  };

  const triggerLogoUpload = () => {
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
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        <ImageIcon className="h-3.5 w-3.5" />
        Logo/Branding
      </Label>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border rounded-lg">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ImageIcon className="h-5 w-5 text-gray-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {logoImage ? "Logo uploaded" : "No logo"}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {logoImage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCustomization({ logoImage: undefined })}
              className="flex-1 sm:flex-initial"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={triggerLogoUpload}
            disabled={uploadingLogo}
            className="flex-1 sm:flex-initial"
          >
            {uploadingLogo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

