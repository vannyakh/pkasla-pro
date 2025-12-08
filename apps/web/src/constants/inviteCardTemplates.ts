export type TemplateKey = 'elegant' | 'modern' | 'romantic' | 'luxury' | 'botanical' | 'ocean' | 'sunset' | 'classic'

export interface CardTemplate {
  name: string
  background: string
  accentColor: string
  textColor: string
  fontFamily: string
  description?: string
}

export const CARD_TEMPLATES: Record<TemplateKey, CardTemplate> = {
  elegant: {
    name: 'Elegant Gold',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #f5f5f5 100%)',
    accentColor: '#d4af37',
    textColor: '#333333',
    fontFamily: 'serif',
    description: 'Sophisticated gold accents on elegant white',
  },
  modern: {
    name: 'Modern Minimal',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    fontFamily: 'sans-serif',
    description: 'Bold purple gradient with clean lines',
  },
  romantic: {
    name: 'Romantic Rose',
    background: 'linear-gradient(135deg, #ffeef8 0%, #ffe0f0 50%, #ffd6e8 100%)',
    accentColor: '#e91e63',
    textColor: '#4a4a4a',
    fontFamily: 'cursive',
    description: 'Soft pink tones for romantic occasions',
  },
  luxury: {
    name: 'Luxury Black',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
    accentColor: '#ffd700',
    textColor: '#ffffff',
    fontFamily: 'serif',
    description: 'Premium black with golden highlights',
  },
  botanical: {
    name: 'Botanical Green',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
    accentColor: '#2e7d32',
    textColor: '#1b5e20',
    fontFamily: 'sans-serif',
    description: 'Fresh green tones inspired by nature',
  },
  ocean: {
    name: 'Ocean Blue',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 50%, #42a5f5 100%)',
    accentColor: '#0277bd',
    textColor: '#01579b',
    fontFamily: 'sans-serif',
    description: 'Calming blue ocean waves',
  },
  sunset: {
    name: 'Sunset Orange',
    background: 'linear-gradient(135deg, #fff3e0 0%, #ffb74d 50%, #ff9800 100%)',
    accentColor: '#e65100',
    textColor: '#bf360c',
    fontFamily: 'serif',
    description: 'Warm sunset colors',
  },
  classic: {
    name: 'Classic Ivory',
    background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 50%, #eeeeee 100%)',
    accentColor: '#424242',
    textColor: '#212121',
    fontFamily: 'serif',
    description: 'Timeless ivory with elegant simplicity',
  },
}

