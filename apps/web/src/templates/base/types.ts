/**
 * Template metadata and configuration types
 */

export interface TemplateColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  text?: string;
  highlight?: string;
  emphasis?: string;
  [key: string]: string | undefined;
}

export interface TemplateFonts {
  khmer?: string;
  moulpali?: string;
  khangkomutt?: string;
  primary?: string;
  secondary?: string;
  [key: string]: string | undefined;
}

export interface TemplateImages {
  background?: string;
  decorativeTopLeft?: string;
  decorativeTopRight?: string;
  decorativeBottomLeft?: string;
  decorativeBottomRight?: string;
  decorativeBorder?: string;
  frameBtn?: string;
  frameGuestName?: string;
  pattern?: string;
  butterfly1?: string;
  butterfly2?: string;
  butterfly3?: string;
  [key: string]: string | undefined;
}

export interface TemplateAssets {
  colors: TemplateColors;
  fonts: TemplateFonts;
  images: TemplateImages;
}

export interface TemplateSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface TemplateMetadata {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string; // 'wedding', 'birthday', 'anniversary', 'corporate', etc.
  tags: string[];
  thumbnail?: string;
  preview?: string;
  isPremium?: boolean;
  defaultAssets: TemplateAssets;
  seo?: TemplateSEO;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateProps {
  event?: Record<string, unknown>; // Event data from backend
  guest?: Record<string, unknown>; // Guest data from backend
  assets?: Partial<TemplateAssets>; // Customized assets override defaults
}

