/**
 * Central template registry
 * Exports all template metadata and utility functions
 */

import type { TemplateMetadata, TemplateAssets } from './types';

// Import all template metadata
import modernMinimalMetadata from './modern-minimal/metadata';
import elegantRoseMetadata from './elegant-rose/metadata';
import tropicalParadiseMetadata from './tropical-paradise/metadata';
import vintageLaceMetadata from './vintage-lace/metadata';
import classicGoldMetadata from './classic-gold/metadata';
import corporateProfessionalMetadata from './corporate-professional/metadata';
import birthdayCelebrationMetadata from './birthday-celebration/metadata';
import anniversaryRomanceMetadata from './anniversary-romance/metadata';

/**
 * Registry of all available templates
 */
export const TEMPLATE_REGISTRY: Record<string, TemplateMetadata> = {
  'modern-minimal': modernMinimalMetadata,
  'elegant-rose': elegantRoseMetadata,
  'tropical-paradise': tropicalParadiseMetadata,
  'vintage-lace': vintageLaceMetadata,
  'classic-gold': classicGoldMetadata,
  'corporate-professional': corporateProfessionalMetadata,
  'birthday-celebration': birthdayCelebrationMetadata,
  'anniversary-romance': anniversaryRomanceMetadata,
};

/**
 * Get all templates as an array
 */
export const getAllTemplates = (): TemplateMetadata[] => {
  return Object.values(TEMPLATE_REGISTRY);
};

/**
 * Get template metadata by slug
 */
export const getTemplateBySlug = (slug: string): TemplateMetadata | undefined => {
  return TEMPLATE_REGISTRY[slug];
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: string): TemplateMetadata[] => {
  return getAllTemplates().filter((template) => template.category === category);
};

/**
 * Get templates by tag
 */
export const getTemplatesByTag = (tag: string): TemplateMetadata[] => {
  return getAllTemplates().filter((template) => template.tags.includes(tag));
};

/**
 * Get premium templates
 */
export const getPremiumTemplates = (): TemplateMetadata[] => {
  return getAllTemplates().filter((template) => template.isPremium);
};

/**
 * Get free templates
 */
export const getFreeTemplates = (): TemplateMetadata[] => {
  return getAllTemplates().filter((template) => !template.isPremium);
};

/**
 * Merge custom assets with default template assets
 */
export const mergeTemplateAssets = (
  defaultAssets: TemplateAssets,
  customAssets?: Partial<TemplateAssets>
): TemplateAssets => {
  if (!customAssets) {
    return defaultAssets;
  }

  return {
    colors: {
      ...defaultAssets.colors,
      ...customAssets.colors,
    },
    fonts: {
      ...defaultAssets.fonts,
      ...customAssets.fonts,
    },
    images: {
      ...defaultAssets.images,
      ...customAssets.images,
    },
  };
};

/**
 * Get all unique categories
 */
export const getAllCategories = (): string[] => {
  const categories = new Set(getAllTemplates().map((t) => t.category));
  return Array.from(categories).sort();
};

/**
 * Get all unique tags
 */
export const getAllTags = (): string[] => {
  const tags = new Set(getAllTemplates().flatMap((t) => t.tags));
  return Array.from(tags).sort();
};

// Re-export types
export type { TemplateMetadata, TemplateAssets, TemplateColors, TemplateFonts, TemplateImages, TemplateProps } from './types';

// Re-export utilities
export * from './utils';

// Re-export hooks
export * from './hooks';

// Re-export SEO utilities
export * from './seo';

