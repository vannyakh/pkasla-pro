"use client";

import React, { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Node,
  NodeChange,
  NodeProps,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  useQRCustomizationStore,
  type QRElement,
} from "@/store/qrCustomization";
import { QRElementNode, type QRElementData } from "./nodes/QRElementNode";

interface DraggableCanvasProps {
  qrCodeUrl: string;
}

// Custom node types for ReactFlow
const nodeTypes = {
  qrElement: QRElementNode as React.ComponentType<NodeProps>,
};

/**
 * DraggableCanvas - Main canvas component using ReactFlow
 * Handles drag-and-drop functionality for QR code elements
 */
export function DraggableCanvas({ qrCodeUrl }: DraggableCanvasProps) {
  // Store state
  const customization = useQRCustomizationStore((state) => state.customization);
  const selectedElementId = useQRCustomizationStore(
    (state) => state.customization.selectedElementId
  );
  const moveElement = useQRCustomizationStore((state) => state.moveElement);
  const selectElement = useQRCustomizationStore((state) => state.selectElement);
  const removeElement = useQRCustomizationStore((state) => state.removeElement);

  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<QRElementData>>([]);
  const [edges, , onEdgesChange] = useEdgesState([]);

  // Event Handlers
  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<QRElementData>>[]) => {
      onNodesChange(changes);

      // Sync changes to store
      changes.forEach((change) => {
        if (change.type === "position" && change.position && !change.dragging) {
          moveElement(change.id, change.position.x, change.position.y);
        }
        if (change.type === "select") {
          selectElement(change.selected ? change.id : null);
        }
      });
    },
    [onNodesChange, moveElement, selectElement]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<QRElementData>) => {
      selectElement(node.id);
    },
    [selectElement]
  );

  const handlePaneClick = useCallback(() => {
    selectElement(null);
  }, [selectElement]);

  // Helper function to get responsive QR size
  const getResponsiveQRSize = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      const maxSize = Math.min(customization.qrSize, window.innerWidth - 80);
      return Math.max(200, maxSize);
    }
    return customization.qrSize;
  }, [customization.qrSize]);

  // Create default elements for initial canvas setup - positioned relative to center
  const createDefaultElements = useCallback((): QRElement[] => {
    const qrSize = getResponsiveQRSize();
    const centerX = 0;
    const centerY = 0;
    
    return [
      {
        id: "qr-code",
        type: "qr",
        x: centerX - qrSize / 2,
        y: centerY - qrSize / 2,
        visible: true,
        locked: false,
        zIndex: 1,
        width: qrSize,
        height: qrSize,
      },
      {
        id: "title",
        type: "title",
        x: centerX - 100,
        y: centerY - qrSize / 2 - 80,
        visible: true,
        locked: false,
        zIndex: 2,
        text: customization.titleText || "Scan to Join",
        fontSize: 24,
        color: "#1f2937",
      },
      {
        id: "subtitle",
        type: "subtitle",
        x: centerX - 100,
        y: centerY + qrSize / 2 + 30,
        visible: true,
        locked: false,
        zIndex: 3,
        text: customization.subtitleText || "Join our event",
        fontSize: 14,
        color: "#6b7280",
      },
    ];
  }, [customization.titleText, customization.subtitleText, getResponsiveQRSize]);

  // Initialize default elements on mount if empty
  useEffect(() => {
    if (customization.elements.length === 0) {
      const defaultElements = createDefaultElements();
      useQRCustomizationStore.getState().setCustomization({
        elements: defaultElements,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert store elements to ReactFlow nodes
  useEffect(() => {
    const flowNodes: Node<QRElementData>[] = customization.elements
      .filter((element) => element.visible) // Only include visible elements
      .map((element) => ({
        id: element.id,
        type: "qrElement",
        position: { x: element.x, y: element.y },
        data: {
          type: element.type,
          visible: element.visible,
          locked: element.locked,
          text: element.text,
          fontSize: element.fontSize,
          color: element.color,
          imageUrl: element.imageUrl,
          width: element.width,
          height: element.height,
          qrCodeUrl: element.type === "qr" ? qrCodeUrl : undefined,
          qrFgColor: customization.qrFgColor,
          qrBgColor: customization.qrBgColor,
          onDelete: () => removeElement(element.id),
        },
        draggable: !element.locked,
        selectable: !element.locked,
        zIndex: element.zIndex,
        selected: selectedElementId === element.id,
      }));

    setNodes(flowNodes);
  }, [
    customization.elements,
    customization.qrFgColor,
    customization.qrBgColor,
    qrCodeUrl,
    selectedElementId,
    removeElement,
    setNodes,
  ]);

  return (
    <div className="relative w-full h-full">
      {/* Artboard Background Layer */}
      <div
        id="qr-preview-card"
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: `${customization.canvasWidth}px`,
          height: `${customization.canvasHeight}px`,
          backgroundColor: customization.backgroundColor,
          border: customization.customBorderColor
            ? `2px solid ${customization.customBorderColor}`
            : "2px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
          zIndex: 0,
        }}
      />

      {/* ReactFlow Infinite Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.3,
          includeHiddenNodes: false,
          maxZoom: 1,
          minZoom: 0.5,
        }}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        panOnScroll={true}
        selectionOnDrag={true}
        panOnDrag={[1, 2]}
        selectNodesOnDrag={false}
        zoomOnDoubleClick={false}
        preventScrolling={true}
        className="bg-gray-50"
      >
        {/* Infinite Grid Background */}
        <Background
          color="#d1d5db"
          gap={20}
          size={1}
          className="bg-gray-50"
        />

        {/* Enhanced Controls */}
        <Controls
          showInteractive={false}
          position="bottom-right"
          className="bg-white! shadow-lg! rounded-lg! border! border-gray-200! m-4!"
        />

        {/* Mini Map */}
        <MiniMap
          nodeColor={(node) => {
            if (node.selected) return "#3b82f6";
            const nodeData = node.data as QRElementData;
            if (nodeData.type === "qr") return "#8b5cf6";
            if (nodeData.type === "logo") return "#10b981";
            if (nodeData.type === "title") return "#f59e0b";
            if (nodeData.type === "subtitle") return "#6b7280";
            return "#e5e7eb";
          }}
          className="bg-white! shadow-lg! rounded-lg! border! border-gray-200! m-4!"
          position="bottom-left"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Artboard Info Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
          <span className="text-xs font-medium text-gray-700">
            {customization.canvasWidth} × {customization.canvasHeight}px
          </span>
        </div>
      </div>
    </div>
  );
}
