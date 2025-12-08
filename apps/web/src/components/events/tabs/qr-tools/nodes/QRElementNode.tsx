"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { QRCodeSVG } from "qrcode.react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export type QRElementType = "logo" | "title" | "subtitle" | "qr" | "eventDetails" | "date" | "venue";

export interface QRElementData extends Record<string, unknown> {
  type: QRElementType;
  visible: boolean;
  locked: boolean;
  text?: string;
  fontSize?: number;
  color?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  qrCodeUrl?: string;
  qrFgColor?: string;
  qrBgColor?: string;
  onDelete?: () => void;
}

/**
 * QRElementNode - Custom ReactFlow node for rendering QR code elements
 * Supports different element types: logo, title, subtitle, qr, eventDetails, date, venue
 */
export function QRElementNode({ data, selected }: NodeProps) {
  const nodeData = data as QRElementData;
  
  if (!nodeData.visible) return null;

  const renderContent = (): React.ReactNode => {
    switch (nodeData.type) {
      case "logo":
        if (nodeData.imageUrl) {
          return (
            <div className="relative h-16 w-auto">
              <Image
                src={nodeData.imageUrl}
                alt="Logo"
                width={200}
                height={64}
                className="h-full w-auto object-contain"
              />
            </div>
          );
        }
        return <div className="text-gray-400 text-xs">No logo</div>;

      case "title":
        return (
          <h3
            className="font-bold text-center whitespace-nowrap px-2"
            style={{
              color: nodeData.color || "#1f2937",
              fontSize: `${nodeData.fontSize || 24}px`,
            }}
          >
            {nodeData.text || "Title"}
          </h3>
        );

      case "subtitle":
      case "eventDetails":
        return (
          <p
            className="text-center whitespace-nowrap px-2"
            style={{
              color: nodeData.color || "#6b7280",
              fontSize: `${nodeData.fontSize || 14}px`,
            }}
          >
            {nodeData.text || "Text"}
          </p>
        );

      case "qr":
        if (!nodeData.qrCodeUrl) {
          return <div className="text-gray-400 text-xs">No QR URL</div>;
        }
        return (
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <QRCodeSVG
              value={nodeData.qrCodeUrl}
              size={nodeData.width || 280}
              level="H"
              includeMargin={true}
              fgColor={nodeData.qrFgColor || "#000000"}
              bgColor={nodeData.qrBgColor || "#ffffff"}
            />
          </div>
        );

      case "date":
      case "venue":
        return (
          <p
            className="text-center wrap-break-word max-w-xs px-2"
            style={{
              color: nodeData.color || "#9ca3af",
              fontSize: `${nodeData.fontSize || 12}px`,
            }}
          >
            {nodeData.text || ""}
          </p>
        );

      default:
        return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <div className="relative group">
      {/* Selection toolbar */}
      {selected && !nodeData.locked && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-lg text-xs z-50 shadow-lg whitespace-nowrap">
          <span>Selected</span>
          {nodeData.onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-white hover:bg-primary/80 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                nodeData.onDelete?.();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      
      {/* Node content with selection ring */}
      <div
        className={`
          transition-all duration-200
          ${nodeData.locked ? "cursor-not-allowed opacity-70" : "cursor-move"}
          ${selected ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""}
        `}
        style={{
          pointerEvents: nodeData.locked ? "none" : "all",
        }}
      >
        {content}
      </div>

      {/* Hidden handles required by ReactFlow */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: "none" }}
      />
    </div>
  );
}

