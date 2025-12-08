"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QRElement {
  id: string;
  type: "logo" | "title" | "subtitle" | "qr" | "eventDetails" | "date" | "venue";
  x: number;
  y: number;
  width?: number;
  height?: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  // Element-specific properties
  text?: string;
  fontSize?: number;
  color?: string;
  imageUrl?: string;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "custom";

export interface ExportSettings {
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  format: "png" | "jpg" | "svg";
  quality: number;
  scale: number;
}

export interface QRCustomization {
  qrFgColor: string;
  qrBgColor: string;
  qrSize: number;
  logoImage?: string;
  titleText: string;
  subtitleText: string;
  showEventDetails: boolean;
  customBorderColor?: string;
  // Canvas properties
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  // Elements array for drag and drop
  elements: QRElement[];
  selectedElementId: string | null;
  // Export settings
  exportSettings: ExportSettings;
}

interface QRCustomizationStore {
  customization: QRCustomization;
  setCustomization: (updates: Partial<QRCustomization>) => void;
  updateElement: (elementId: string, updates: Partial<QRElement>) => void;
  addElement: (element: Omit<QRElement, "id">) => void;
  removeElement: (elementId: string) => void;
  selectElement: (elementId: string | null) => void;
  moveElement: (elementId: string, x: number, y: number) => void;
  setExportSettings: (settings: Partial<ExportSettings>) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  resetCustomization: () => void;
}

const defaultCustomization: QRCustomization = {
  qrFgColor: "#000000",
  qrBgColor: "#ffffff",
  qrSize: 280,
  titleText: "Scan to Join",
  subtitleText: "Join our event",
  showEventDetails: true,
  canvasWidth: 600,
  canvasHeight: 800,
  backgroundColor: "#ffffff",
  elements: [],
  selectedElementId: null,
  exportSettings: {
    aspectRatio: "1:1",
    width: 1000,
    height: 1000,
    format: "png",
    quality: 95,
    scale: 2,
  },
};

const defaultExportSettings: ExportSettings = {
  aspectRatio: "1:1",
  width: 1000,
  height: 1000,
  format: "png",
  quality: 95,
  scale: 2,
};

export const useQRCustomizationStore = create<QRCustomizationStore>()(
  persist(
    (set, get) => ({
      customization: defaultCustomization,

      setCustomization: (updates) =>
        set((state) => ({
          customization: { 
            ...state.customization, 
            ...updates,
            // Ensure exportSettings always exists
            exportSettings: updates.exportSettings || state.customization.exportSettings || defaultExportSettings,
          },
        })),

      updateElement: (elementId, updates) =>
        set((state) => ({
          customization: {
            ...state.customization,
            elements: state.customization.elements.map((el) =>
              el.id === elementId ? { ...el, ...updates } : el
            ),
          },
        })),

      addElement: (element) => {
        const newElement: QRElement = {
          ...element,
          id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          customization: {
            ...state.customization,
            elements: [...state.customization.elements, newElement],
            selectedElementId: newElement.id,
          },
        }));
      },

      removeElement: (elementId) =>
        set((state) => ({
          customization: {
            ...state.customization,
            elements: state.customization.elements.filter(
              (el) => el.id !== elementId
            ),
            selectedElementId:
              state.customization.selectedElementId === elementId
                ? null
                : state.customization.selectedElementId,
          },
        })),

      selectElement: (elementId) =>
        set((state) => ({
          customization: {
            ...state.customization,
            selectedElementId: elementId,
          },
        })),

      moveElement: (elementId, x, y) =>
        set((state) => ({
          customization: {
            ...state.customization,
            elements: state.customization.elements.map((el) =>
              el.id === elementId ? { ...el, x, y } : el
            ),
          },
        })),

      setExportSettings: (settings) =>
        set((state) => ({
          customization: {
            ...state.customization,
            exportSettings: {
              ...(state.customization.exportSettings || defaultExportSettings),
              ...settings,
            },
          },
        })),

      setAspectRatio: (ratio) => {
        const currentSettings = get().customization.exportSettings || defaultExportSettings;
        const aspectRatios: Record<AspectRatio, { width: number; height: number }> = {
          "1:1": { width: 1000, height: 1000 },
          "16:9": { width: 1920, height: 1080 },
          "9:16": { width: 1080, height: 1920 },
          "4:3": { width: 1600, height: 1200 },
          "3:4": { width: 1200, height: 1600 },
          "custom": { width: currentSettings.width, height: currentSettings.height },
        };

        const dimensions = aspectRatios[ratio];
        set((state) => ({
          customization: {
            ...state.customization,
            exportSettings: {
              ...(state.customization.exportSettings || defaultExportSettings),
              aspectRatio: ratio,
              width: dimensions.width,
              height: dimensions.height,
            },
          },
        }));
      },

      resetCustomization: () =>
        set({
          customization: defaultCustomization,
        }),
    }),
    {
      name: "qr-customization-store",
      partialize: (state) => ({
        customization: state.customization,
      }),
      // Migration function to handle old persisted data
      migrate: (persistedState: unknown) => {
        const state = persistedState as { customization?: QRCustomization };
        if (state && state.customization) {
          // Ensure exportSettings exists
          if (!state.customization.exportSettings) {
            state.customization.exportSettings = defaultExportSettings;
          }
        }
        return state;
      },
      version: 1,
    }
  )
);

