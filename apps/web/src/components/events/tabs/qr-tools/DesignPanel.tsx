"use client";

import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette, QrCode, Square, Type } from "lucide-react";
import { useQRCustomizationStore } from "@/store/qrCustomization";

interface ColorUsage {
  color: string;
  usedIn: {
    type: "qr-fg" | "qr-bg" | "canvas-bg" | "border" | "element";
    label: string;
    elementId?: string;
    elementType?: string;
  }[];
}

interface ColorItemProps {
  colorUsage: ColorUsage;
  onColorChange: (oldColor: string, newColor: string) => void;
}

function ColorItem({ colorUsage, onColorChange }: ColorItemProps) {
  const getIcon = () => {
    const type = colorUsage.usedIn[0]?.type;
    switch (type) {
      case "qr-fg":
      case "qr-bg":
        return <QrCode className="h-3.5 w-3.5" />;
      case "canvas-bg":
      case "border":
        return <Square className="h-3.5 w-3.5" />;
      case "element":
        return <Type className="h-3.5 w-3.5" />;
      default:
        return <Palette className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 border border-gray-200">
      {/* Color Preview */}
      <div className="relative">
        <Input
          type="color"
          value={colorUsage.color}
          onChange={(e) => onColorChange(colorUsage.color, e.target.value)}
          className="h-10 w-10 p-0.5 cursor-pointer border-2"
          style={{ backgroundColor: colorUsage.color }}
        />
      </div>

      {/* Color Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          {getIcon()}
          <span className="text-xs font-mono font-semibold uppercase">
            {colorUsage.color}
          </span>
          {colorUsage.usedIn.length > 1 && (
            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              {colorUsage.usedIn.length} uses
            </span>
          )}
        </div>
        <div className="space-y-0.5 max-h-16 overflow-y-auto">
          {colorUsage.usedIn.map((usage, idx) => (
            <div
              key={idx}
              className="text-[10px] text-gray-600 truncate flex items-center gap-1"
              title={usage.label}
            >
              <span className="inline-block w-1 h-1 rounded-full bg-gray-400" />
              <span className="truncate">{usage.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hex Input */}
      <Input
        type="text"
        value={colorUsage.color.toUpperCase()}
        onChange={(e) => {
          let input = e.target.value.trim().toUpperCase();
          
          // Auto-add # if missing
          if (!input.startsWith("#")) {
            input = "#" + input;
          }
          
          // Allow partial input while typing
          if (input.length <= 7) {
            e.target.value = input;
          }
          
          // Only trigger change when we have a valid complete hex color
          if (/^#[0-9A-F]{6}$/.test(input)) {
            onColorChange(colorUsage.color, input.toLowerCase());
          }
        }}
        onBlur={(e) => {
          // Revert to original color if input is invalid on blur
          const input = e.target.value.trim();
          if (!/^#[0-9A-Fa-f]{6}$/.test(input)) {
            e.target.value = colorUsage.color.toUpperCase();
          }
        }}
        className="w-20 h-8 text-[10px] font-mono uppercase text-center"
        maxLength={7}
        placeholder="#000000"
      />
    </div>
  );
}

export function DesignPanel() {
  const customization = useQRCustomizationStore((state) => state.customization);
  const setCustomization = useQRCustomizationStore((state) => state.setCustomization);
  const updateElement = useQRCustomizationStore((state) => state.updateElement);

  // Collect all colors used in the design
  const usedColors = useMemo(() => {
    const colorMap = new Map<string, ColorUsage>();

    // Helper to add color usage
    const addColorUsage = (
      color: string,
      type: ColorUsage["usedIn"][0]["type"],
      label: string,
      elementId?: string,
      elementType?: string
    ) => {
      const normalizedColor = color.toLowerCase();
      if (!colorMap.has(normalizedColor)) {
        colorMap.set(normalizedColor, {
          color: normalizedColor,
          usedIn: [],
        });
      }
      colorMap.get(normalizedColor)!.usedIn.push({
        type,
        label,
        elementId,
        elementType,
      });
    };

    // QR Code colors
    addColorUsage(customization.qrFgColor, "qr-fg", "QR Foreground");
    addColorUsage(customization.qrBgColor, "qr-bg", "QR Background");

    // Canvas background
    addColorUsage(customization.backgroundColor, "canvas-bg", "Canvas Background");

    // Border color (if set)
    if (customization.customBorderColor) {
      addColorUsage(customization.customBorderColor, "border", "Border");
    }

    // Element colors
    customization.elements.forEach((element) => {
      if (element.color && element.visible) {
        const elementLabel = element.text
          ? `${element.type}: ${element.text.substring(0, 15)}${element.text.length > 15 ? "..." : ""}`
          : `${element.type}`;
        addColorUsage(
          element.color,
          "element",
          elementLabel,
          element.id,
          element.type
        );
      }
    });

    return Array.from(colorMap.values());
  }, [customization]);

  // Handle color change - update all usages of the color across all states
  const handleColorChange = (oldColor: string, newColor: string) => {
    // Normalize colors to lowercase for comparison
    const normalizedOld = oldColor.toLowerCase().trim();
    const normalizedNew = newColor.toLowerCase().trim();

    // Validate new color format
    if (!/^#[0-9a-f]{6}$/i.test(normalizedNew)) {
      console.warn("Invalid color format:", newColor);
      return;
    }

    // Skip if colors are the same
    if (normalizedOld === normalizedNew) return;

    // Batch state updates for better performance
    const updates: Partial<typeof customization> = {};

    // Check and update QR foreground color
    if (customization.qrFgColor.toLowerCase() === normalizedOld) {
      updates.qrFgColor = normalizedNew;
    }

    // Check and update QR background color
    if (customization.qrBgColor.toLowerCase() === normalizedOld) {
      updates.qrBgColor = normalizedNew;
    }

    // Check and update canvas background color
    if (customization.backgroundColor.toLowerCase() === normalizedOld) {
      updates.backgroundColor = normalizedNew;
    }

    // Check and update border color
    if (customization.customBorderColor?.toLowerCase() === normalizedOld) {
      updates.customBorderColor = normalizedNew;
    }

    // Apply all customization updates in a single batch
    if (Object.keys(updates).length > 0) {
      setCustomization(updates);
    }

    // Update all element colors that match
    let elementsUpdated = 0;
    customization.elements.forEach((element) => {
      if (element.color?.toLowerCase() === normalizedOld) {
        updateElement(element.id, { color: normalizedNew });
        elementsUpdated++;
      }
    });

    // Log update summary for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`Color updated: ${normalizedOld} → ${normalizedNew}`, {
        customizationUpdates: Object.keys(updates).length,
        elementsUpdated,
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <Label className="text-sm font-semibold">Colors</Label>
        </div>
        <span className="text-xs text-gray-500">{usedColors.length} colors</span>
      </div>
      
      {/* Colors List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {usedColors.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No colors in use
          </div>
        ) : (
          usedColors.map((colorUsage) => (
            <ColorItem
              key={colorUsage.color}
              colorUsage={colorUsage}
              onColorChange={handleColorChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
