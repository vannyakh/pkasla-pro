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

  // Create default elements for initial canvas setup
  const createDefaultElements = useCallback((): QRElement[] => {
    const qrSize = getResponsiveQRSize();
    return [
      {
        id: "qr-code",
        type: "qr",
        x: 150,
        y: 150,
        visible: true,
        locked: false,
        zIndex: 1,
        width: qrSize,
        height: qrSize,
      },
      {
        id: "title",
        type: "title",
        x: 150,
        y: 80,
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
        x: 150,
        y: 450,
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
    <div
      id="qr-preview-card"
      className="relative rounded-lg w-full max-w-full mx-auto overflow-hidden"
    >
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
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        minZoom={0.3}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectNodesOnDrag={false}
      >
        <Background
          color="#d1d5db"
          gap={20}
          size={1}
          style={{ backgroundColor: "#f9fafb" }}
        />
        <Controls
          showInteractive={false}
          position="bottom-right"
          className="bg-white/90! backdrop-blur-sm! rounded-xl! shadow-xl! border! border-gray-200!"
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.selected) return "#3b82f6";
            const nodeData = node.data as QRElementData;
            if (nodeData.type === "qr") return "#8b5cf6";
            if (nodeData.type === "logo") return "#10b981";
            return "#e5e7eb";
          }}
          className="bg-white/90! backdrop-blur-sm! rounded-xl! shadow-xl! border! border-gray-200!"
          position="bottom-left"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
