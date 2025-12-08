"use client";

import React, { useMemo, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useQRCustomizationStore, type QRElement } from "@/store/qrCustomization";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraggableCanvasProps {
  qrCodeUrl: string;
  event?: {
    title?: string;
    date?: string | Date;
    venue?: string;
  };
}

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

export function DraggableCanvas({ qrCodeUrl, event }: DraggableCanvasProps) {
  const customization = useQRCustomizationStore((state) => state.customization);
  const selectedElementId = useQRCustomizationStore(
    (state) => state.customization.selectedElementId
  );
  const moveElement = useQRCustomizationStore((state) => state.moveElement);
  const selectElement = useQRCustomizationStore((state) => state.selectElement);
  const removeElement = useQRCustomizationStore((state) => state.removeElement);
  
  // Drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedFrame = FRAME_STYLES[customization.frameStyle];

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, element: QRElement) => {
    if (element.locked) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setDraggingId(element.id);
    selectElement(element.id);
    
    // Calculate offset from element position to mouse position
    setDragOffset({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    });
  };

  // Handle drag move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    // Keep element within canvas bounds
    const clampedX = Math.max(0, Math.min(newX, canvasRect.width - 100));
    const clampedY = Math.max(0, Math.min(newY, canvasRect.height - 50));
    
    moveElement(draggingId, clampedX, clampedY);
  };

  // Handle drag end
  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent, element: QRElement) => {
    if (element.locked) return;
    
    const touch = e.touches[0];
    setDraggingId(element.id);
    selectElement(element.id);
    
    setDragOffset({
      x: touch.clientX - element.x,
      y: touch.clientY - element.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingId || !canvasRef.current) return;
    
    const touch = e.touches[0];
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = touch.clientX - canvasRect.left - dragOffset.x;
    const newY = touch.clientY - canvasRect.top - dragOffset.y;
    
    const clampedX = Math.max(0, Math.min(newX, canvasRect.width - 100));
    const clampedY = Math.max(0, Math.min(newY, canvasRect.height - 50));
    
    moveElement(draggingId, clampedX, clampedY);
  };

  const handleTouchEnd = () => {
    setDraggingId(null);
  };

  const getTitleColor = () => {
    if (customization.frameStyle === "modern") return "#ffffff";
    return "#1f2937";
  };

  const getTextColor = () => {
    if (customization.frameStyle === "modern") return "#e5e7eb";
    return "#6b7280";
  };

  const getSubtleTextColor = () => {
    if (customization.frameStyle === "modern") return "#d1d5db";
    return "#9ca3af";
  };

  const getResponsiveQRSize = () => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      const maxSize = Math.min(customization.qrSize, window.innerWidth - 80);
      return Math.max(200, maxSize);
    }
    return customization.qrSize;
  };

  // Initialize default elements if empty
  const elements = useMemo(() => {
    if (customization.elements.length === 0) {
      const defaultElements: QRElement[] = [
        {
          id: "logo",
          type: "logo",
          x: 50,
          y: 50,
          visible: !!customization.logoImage,
          locked: false,
          zIndex: 1,
          imageUrl: customization.logoImage,
        },
        {
          id: "title",
          type: "title",
          x: 50,
          y: 120,
          visible: true,
          locked: false,
          zIndex: 2,
          text: customization.titleText,
          fontSize: 24,
          color: getTitleColor(),
        },
        {
          id: "event-title",
          type: "eventDetails",
          x: 50,
          y: 160,
          visible: customization.showEventDetails && !!event?.title,
          locked: false,
          zIndex: 3,
          text: event?.title || "",
          fontSize: 14,
          color: getTextColor(),
        },
        {
          id: "qr-code",
          type: "qr",
          x: 50,
          y: 200,
          visible: true,
          locked: false,
          zIndex: 4,
          width: getResponsiveQRSize(),
          height: getResponsiveQRSize(),
        },
        {
          id: "subtitle",
          type: "subtitle",
          x: 50,
          y: 500,
          visible: true,
          locked: false,
          zIndex: 5,
          text: customization.subtitleText,
          fontSize: 14,
          color: getTextColor(),
        },
        {
          id: "date",
          type: "date",
          x: 50,
          y: 530,
          visible: customization.showEventDetails && !!event?.date,
          locked: false,
          zIndex: 6,
          text: event?.date
            ? typeof event.date === 'string' 
              ? new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : event.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
            : "",
          fontSize: 12,
          color: getSubtleTextColor(),
        },
        {
          id: "venue",
          type: "venue",
          x: 50,
          y: 560,
          visible: customization.showEventDetails && !!event?.venue,
          locked: false,
          zIndex: 7,
          text: event?.venue || "",
          fontSize: 12,
          color: getSubtleTextColor(),
        },
      ];

      // Update store with default elements
      useQRCustomizationStore.getState().setCustomization({
        elements: defaultElements,
      });

      return defaultElements;
    }
    return customization.elements;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customization.elements.length]);

  const renderElement = (element: QRElement) => {
    if (!element.visible) return null;

    const isSelected = selectedElementId === element.id;
    const commonStyle: React.CSSProperties = {
      position: "absolute",
      left: `${element.x}px`,
      top: `${element.y}px`,
      zIndex: element.zIndex,
      cursor: element.locked ? "not-allowed" : "move",
      border: isSelected ? "2px dashed #3b82f6" : "2px solid transparent",
      padding: isSelected ? "2px" : "0",
    };

    let content: React.ReactNode = null;

    switch (element.type) {
      case "logo":
        if (element.imageUrl) {
          content = (
            <img
              src={element.imageUrl}
              alt="Logo"
              className="h-12 sm:h-16 w-auto object-contain"
              style={{ maxWidth: "min(200px, 80vw)" }}
            />
          );
        }
        break;
      case "title":
        content = (
          <h3
            className="font-bold text-center"
            style={{
              color: element.color || getTitleColor(),
              fontSize: `${element.fontSize || 24}px`,
            }}
          >
            {element.text || customization.titleText}
          </h3>
        );
        break;
      case "subtitle":
        content = (
          <p
            className="text-center"
            style={{
              color: element.color || getTextColor(),
              fontSize: `${element.fontSize || 14}px`,
            }}
          >
            {element.text || customization.subtitleText}
          </p>
        );
        break;
      case "eventDetails":
        content = (
          <p
            className="text-center"
            style={{
              color: element.color || getTextColor(),
              fontSize: `${element.fontSize || 14}px`,
            }}
          >
            {element.text || event?.title}
          </p>
        );
        break;
      case "qr":
        content = (
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            <QRCodeSVG
              value={qrCodeUrl}
              size={element.width || getResponsiveQRSize()}
              level="H"
              includeMargin={true}
              fgColor={customization.qrFgColor}
              bgColor={customization.qrBgColor}
            />
          </div>
        );
        break;
      case "date":
        content = (
          <p
            className="text-center wrap-break-word"
            style={{
              color: element.color || getSubtleTextColor(),
              fontSize: `${element.fontSize || 12}px`,
            }}
          >
            {element.text}
          </p>
        );
        break;
      case "venue":
        content = (
          <p
            className="text-center wrap-break-word"
            style={{
              color: element.color || getSubtleTextColor(),
              fontSize: `${element.fontSize || 12}px`,
            }}
          >
            {element.text}
          </p>
        );
        break;
    }

    if (!content) return null;

    const isDragging = draggingId === element.id;

    return (
      <div
        key={element.id}
        style={{
          ...commonStyle,
          opacity: isDragging ? 0.8 : 1,
          transform: `translate(${element.x}px, ${element.y}px)`,
          left: 0,
          top: 0,
        }}
        onMouseDown={(e) => handleMouseDown(e, element)}
        onTouchStart={(e) => handleTouchStart(e, element)}
        onClick={(e) => {
          e.stopPropagation();
          selectElement(element.id);
        }}
        className="select-none"
      >
        {isSelected && (
          <div className="absolute -top-8 left-0 flex gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs z-50">
            <span className="text-xs mr-1">Drag to move</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-white hover:bg-blue-600"
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                removeElement(element.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        {content}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      id="qr-preview-card"
      className="relative flex flex-col items-center justify-center rounded-lg w-full max-w-full mx-auto"
      style={{
        background: selectedFrame.background,
        border: customization.customBorderColor
          ? `4px solid ${customization.customBorderColor}`
          : selectedFrame.border,
        padding:
          typeof window !== "undefined" && window.innerWidth < 640
            ? "16px"
            : selectedFrame.padding,
        boxShadow: selectedFrame.shadow,
        minHeight:
          typeof window !== "undefined" && window.innerWidth < 640
            ? "300px"
            : "400px",
        width: `${customization.canvasWidth}px`,
        height: `${customization.canvasHeight}px`,
        touchAction: draggingId ? "none" : "auto",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          selectElement(null);
        }
      }}
    >
      {elements.map((element) => renderElement(element))}
    </div>
  );
}

