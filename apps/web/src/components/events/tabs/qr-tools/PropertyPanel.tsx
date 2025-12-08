"use client";

import React from "react";
import { useQRCustomizationStore, type QRElement } from "@/store/qrCustomization";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Layers,
  Type,
  Image,
  QrCode,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
} from "lucide-react";

const elementIcons: Record<QRElement["type"], React.ElementType> = {
  qr: QrCode,
  logo: Image,
  title: Type,
  subtitle: Type,
  eventDetails: Type,
  date: Type,
  venue: Type,
};

const elementLabels: Record<QRElement["type"], string> = {
  qr: "QR Code",
  logo: "Image",
  title: "Title",
  subtitle: "Text",
  eventDetails: "Text",
  date: "Text",
  venue: "Text",
};

export function PropertyPanel() {
  const elements = useQRCustomizationStore((state) => state.customization.elements);
  const selectedElementId = useQRCustomizationStore(
    (state) => state.customization.selectedElementId
  );
  const selectElement = useQRCustomizationStore((state) => state.selectElement);
  const updateElement = useQRCustomizationStore((state) => state.updateElement);
  const removeElement = useQRCustomizationStore((state) => state.removeElement);

  // Sort elements by zIndex in descending order (highest first)
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const handleMoveUp = (elementId: string) => {
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    const higherElements = elements.filter((el) => el.zIndex > element.zIndex);
    if (higherElements.length === 0) return;

    const nextElement = higherElements.reduce((prev, curr) =>
      curr.zIndex < prev.zIndex ? curr : prev
    );

    updateElement(elementId, { zIndex: nextElement.zIndex });
    updateElement(nextElement.id, { zIndex: element.zIndex });
  };

  const handleMoveDown = (elementId: string) => {
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    const lowerElements = elements.filter((el) => el.zIndex < element.zIndex);
    if (lowerElements.length === 0) return;

    const prevElement = lowerElements.reduce((prev, curr) =>
      curr.zIndex > prev.zIndex ? curr : prev
    );

    updateElement(elementId, { zIndex: prevElement.zIndex });
    updateElement(prevElement.id, { zIndex: element.zIndex });
  };

  const getElementDisplayName = (element: QRElement) => {
    if (element.text) return element.text;
    if (element.type === "logo") return "Image";
    if (element.type === "qr") return "QR Code";
    return elementLabels[element.type];
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Layers</h3>
            <p className="text-xs text-gray-500">{elements.length} elements</p>
          </div>
        </div>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedElements.map((element, index) => {
            const Icon = elementIcons[element.type];
            const isSelected = selectedElementId === element.id;
            const isFirst = index === 0;
            const isLast = index === sortedElements.length - 1;

            return (
              <div
                key={element.id}
                className={`
                  group relative mb-1 rounded-lg border transition-all cursor-pointer
                  ${
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }
                `}
                onClick={() => selectElement(element.id)}
              >
                <div className="flex items-center gap-2 p-2">
                  {/* Element Icon */}
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? "text-primary" : "text-gray-600"
                    }`}
                  />

                  {/* Element Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getElementDisplayName(element)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(element.x)}, {Math.round(element.y)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1">
                    {/* Move Up/Down */}
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveUp(element.id);
                        }}
                        disabled={isFirst}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveDown(element.id);
                        }}
                        disabled={isLast}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Visibility Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(element.id, { visible: !element.visible });
                      }}
                    >
                      {element.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>

                    {/* Lock Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(element.id, { locked: !element.locked });
                      }}
                    >
                      {element.locked ? (
                        <Lock className="h-3 w-3 text-amber-600" />
                      ) : (
                        <Unlock className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Properties Panel */}
      {selectedElement && (
        <>
          <Separator />
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold mb-3">Properties</h3>

            <div className="space-y-3">
              {/* Position */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">Position</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">X</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          x: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Y</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          y: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Size (for QR and logo) */}
              {(selectedElement.width !== undefined ||
                selectedElement.height !== undefined) && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600">Size</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-500">W</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.width || 0)}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            width: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">H</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.height || 0)}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            height: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Text Properties */}
              {selectedElement.text !== undefined && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600">Text</Label>
                    <Input
                      type="text"
                      value={selectedElement.text}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          text: e.target.value,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>

                  {selectedElement.fontSize !== undefined && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">
                        Font Size
                      </Label>
                      <Input
                        type="number"
                        value={selectedElement.fontSize}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            fontSize: parseInt(e.target.value) || 12,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  )}

                  {selectedElement.color !== undefined && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              color: e.target.value,
                            })
                          }
                          className="h-8 w-12 p-1"
                        />
                        <Input
                          type="text"
                          value={selectedElement.color}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              color: e.target.value,
                            })
                          }
                          className="h-8 text-xs flex-1"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Delete Button */}
              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-4"
                onClick={() => {
                  removeElement(selectedElement.id);
                  selectElement(null);
                }}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete Element
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

