"use client";

import { Label } from "@/components/ui/label";
import { useQRCustomizationStore, type FrameStyleKey } from "@/store/qrCustomization";

const FRAME_STYLES = {
  none: {
    name: "No Frame",
    background: "transparent",
    border: "none",
    padding: "16px",
    shadow: undefined,
  },
  simple: {
    name: "Simple Border",
    background: "#ffffff",
    border: "2px solid #e5e7eb",
    padding: "24px",
    shadow: undefined,
  },
  elegant: {
    name: "Elegant Gold",
    background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
    border: "4px solid #d4af37",
    padding: "32px",
    shadow: undefined,
  },
  modern: {
    name: "Modern Gradient",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    padding: "32px",
    shadow: undefined,
  },
  minimal: {
    name: "Minimal Shadow",
    background: "#ffffff",
    border: "none",
    padding: "32px",
    shadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
  },
};

export function FrameStyleTool() {
  const frameStyle = useQRCustomizationStore(
    (state) => state.customization.frameStyle
  );
  const setCustomization = useQRCustomizationStore(
    (state) => state.setCustomization
  );

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Frame Style</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
        {Object.entries(FRAME_STYLES).map(([key, style]) => (
          <button
            key={key}
            onClick={() =>
              setCustomization({ frameStyle: key as FrameStyleKey })
            }
            className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-left ${
              frameStyle === key
                ? "border-rose-500 bg-rose-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className="h-10 sm:h-12 rounded mb-1 sm:mb-2"
              style={{ background: style.background }}
            />
            <p className="text-xs font-medium">{style.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

