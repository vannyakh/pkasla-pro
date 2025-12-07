/**
 * React hooks for template system
 */

import { useMemo } from 'react';
import type { TemplateAssets, TemplateMetadata } from './types';
import { mergeTemplateAssets } from './index';

/**
 * Hook to use template assets with custom overrides
 */
export const useTemplateAssets = (
  defaultAssets: TemplateAssets,
  customAssets?: Partial<TemplateAssets>
): TemplateAssets => {
  return useMemo(
    () => mergeTemplateAssets(defaultAssets, customAssets),
    [defaultAssets, customAssets]
  );
};

/**
 * Hook to use template metadata
 */
export const useTemplateMetadata = (metadata: TemplateMetadata) => {
  return useMemo(() => metadata, [metadata]);
};

/**
 * Hook to extract template colors
 */
export const useTemplateColors = (assets: TemplateAssets) => {
  return useMemo(() => assets.colors, [assets]);
};

/**
 * Hook to extract template fonts
 */
export const useTemplateFonts = (assets: TemplateAssets) => {
  return useMemo(() => assets.fonts, [assets]);
};

/**
 * Hook to extract template images
 */
export const useTemplateImages = (assets: TemplateAssets) => {
  return useMemo(() => assets.images, [assets]);
};

/**
 * Hook to create CSS variables from template assets
 */
export const useTemplateCSSVariables = (assets: TemplateAssets) => {
  return useMemo(() => {
    const cssVars: Record<string, string> = {};
    
    // Add color variables
    Object.entries(assets.colors).forEach(([key, value]) => {
      if (value) {
        cssVars[`--template-color-${key}`] = value;
      }
    });
    
    // Add font variables (as CSS class names)
    Object.entries(assets.fonts).forEach(([key, value]) => {
      if (value) {
        cssVars[`--template-font-${key}`] = value;
      }
    });
    
    return cssVars;
  }, [assets]);
};

