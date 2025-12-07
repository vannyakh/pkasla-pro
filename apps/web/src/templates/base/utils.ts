/**
 * Template utility functions
 */

import type { TemplateAssets, TemplateColors, TemplateFonts, TemplateImages } from './types';

/**
 * Get color value with fallback
 */
export const getColor = (
  colors: TemplateColors,
  key: string,
  fallback: string = '#000000'
): string => {
  return colors[key] || fallback;
};

/**
 * Get font value with fallback
 */
export const getFont = (
  fonts: TemplateFonts,
  key: string,
  fallback: string = 'font-sans'
): string => {
  return fonts[key] || fallback;
};

/**
 * Get image path with fallback
 */
export const getImage = (
  images: TemplateImages,
  key: string,
  fallback: string = '/images/placeholder.png'
): string => {
  return images[key] || fallback;
};

/**
 * Create style object from colors
 */
export const createColorStyles = (colors: TemplateColors) => {
  const styles: Record<string, any> = {};
  
  Object.entries(colors).forEach(([key, value]) => {
    if (value) {
      styles[`--color-${key}`] = value;
    }
  });
  
  return styles;
};

/**
 * Validate template assets structure
 */
export const validateTemplateAssets = (assets: Partial<TemplateAssets>): boolean => {
  if (!assets) return false;
  
  // Check if at least one of the main properties exists
  return !!(assets.colors || assets.fonts || assets.images);
};

/**
 * Deep merge two objects
 */
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target };
  
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];
    
    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key as keyof T] = deepMerge(targetValue, sourceValue as any);
    } else if (sourceValue !== undefined) {
      result[key as keyof T] = sourceValue as T[keyof T];
    }
  });
  
  return result;
};

