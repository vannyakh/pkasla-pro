"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  MousePointer2,
  Move,
  QrCode,
  Type,
  Image,
  Layers,
  Palette,
  Settings,
  LayoutTemplate
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ToolType = "select" | "move" | "qr" | "text" | "image" | "frame" | "layers" | "design" | "settings";

interface Tool {
  id: ToolType;
  icon: React.ElementType;
  label: string;
  description: string;
  shortcut?: string;
}

const tools: Tool[] = [
  {
    id: "select",
    icon: MousePointer2,
    label: "Select",
    description: "Select and edit elements",
    shortcut: "V",
  },
  {
    id: "move",
    icon: Move,
    label: "Move",
    description: "Move elements around",
    shortcut: "M",
  },
  {
    id: "qr",
    icon: QrCode,
    label: "QR Code",
    description: "Add QR code elements",
    shortcut: "Q",
  },
  {
    id: "text",
    icon: Type,
    label: "Text",
    description: "Add and edit text",
    shortcut: "T",
  },
  {
    id: "image",
    icon: Image,
    label: "Image",
    description: "Upload images and logos",
    shortcut: "I",
  },
  {
    id: "frame",
    icon: LayoutTemplate,
    label: "Frame",
    description: "Social platform sizes",
    shortcut: "F",
  },
  {
    id: "layers",
    icon: Layers,
    label: "Layers",
    description: "Manage element layers",
    shortcut: "L",
  },
  {
    id: "design",
    icon: Palette,
    label: "Design",
    description: "Colors and styling",
    shortcut: "D",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    description: "Canvas settings",
    shortcut: "S",
  },
];

interface ToolbarPanelProps {
  selectedTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

export function ToolbarPanel({ selectedTool, onToolChange }: ToolbarPanelProps) {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
      {tools.map((tool, index) => {
        const Icon = tool.icon;
        const isActive = selectedTool === tool.id;
        
        // Add separators to group tools visually
        // After move tools (index 1) and after add tools (index 5)
        const showSeparator = index === 1 || index === 5;

        return (
          <React.Fragment key={tool.id}>
            <Tooltip>
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
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{tool.label}</p>
                    {tool.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 rounded border border-gray-300">
                        {tool.shortcut}
                      </kbd>
                    )}
                  </div>
                  <p className="text-gray-500 mt-0.5">{tool.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
            {showSeparator && (
              <div className="w-8 h-px bg-gray-300 my-1" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

