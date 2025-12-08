"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  QrCode,
  Type,
  Image,
  Layers,
  Palette,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ToolType = "qr" | "text" | "image" | "layers" | "design" | "settings";

interface Tool {
  id: ToolType;
  icon: React.ElementType;
  label: string;
  description: string;
}

const tools: Tool[] = [
  {
    id: "qr",
    icon: QrCode,
    label: "QR Code",
    description: "Add QR code elements",
  },
  {
    id: "text",
    icon: Type,
    label: "Text",
    description: "Add and edit text",
  },
  {
    id: "image",
    icon: Image,
    label: "Image",
    description: "Upload images and logos",
  },
  {
    id: "layers",
    icon: Layers,
    label: "Layers",
    description: "Manage element layers",
  },
  {
    id: "design",
    icon: Palette,
    label: "Design",
    description: "Colors and styling",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    description: "Canvas settings",
  },
];

interface ToolbarPanelProps {
  selectedTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

export function ToolbarPanel({ selectedTool, onToolChange }: ToolbarPanelProps) {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = selectedTool === tool.id;

        return (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onToolChange(tool.id)}
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                  "hover:bg-gray-100 active:scale-95",
                  isActive && "bg-primary/10 text-primary border-2 border-primary/30"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : "text-gray-600"
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="text-xs">
                <p className="font-semibold">{tool.label}</p>
                <p className="text-gray-500">{tool.description}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

