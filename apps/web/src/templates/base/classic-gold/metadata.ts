import type { TemplateMetadata } from '../types';

export const metadata: TemplateMetadata = {
  id: 'classic-gold',
  slug: 'classic-gold',
  name: 'Classic Gold',
  description: 'A luxurious gold-themed wedding invitation',
  category: 'wedding',
  tags: ['classic', 'luxury', 'gold', 'elegant'],
  thumbnail: '/images/assets/classic-gold/thumbnail.png',
  preview: '/images/assets/classic-gold/classic-gold.png',
  isPremium: true,
  seo: {
    title: 'Classic Gold Luxury Wedding Invitation Template',
    description: 'Premium gold-themed wedding invitation template with luxurious design. Ideal for elegant and upscale wedding celebrations.',
    keywords: [
      'gold wedding invitation',
      'luxury wedding template',
      'premium wedding invite',
      'elegant gold wedding',
      'upscale wedding invitation',
    ],
  },
  defaultAssets: {
    colors: {
      primary: '#FFD700', // Gold
      secondary: '#B8860B', // Dark gold
      accent: '#FFF8DC', // Cornsilk
      text: '#ffffff',
      highlight: '#DAA520', // Goldenrod
      emphasis: '#8B7500', // Dark goldenrod
    },
    fonts: {
      khmer: 'font-preahvihear',
      moulpali: 'font-moulpali',
      khangkomutt: 'font-khangkomutt',
    },
    images: {
      background: '/images/assets/classic-gold/classic-gold.png',
      decorativeTopLeft: '/images/assets/classic-gold/frame-top-left.png',
      decorativeTopRight: '/images/assets/classic-gold/frame-top-right.png',
      decorativeBottomLeft: '/images/assets/classic-gold/frame-bottom-left.png',
      decorativeBottomRight: '/images/assets/classic-gold/frame-bottom-right.png',
      decorativeBorder: '/images/assets/classic-gold/frame-bottom.png',
      frameBtn: '/images/assets/classic-gold/frame-btn.png',
      frameGuestName: '/images/assets/classic-gold/frame-guest-name.png',
    },
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export default metadata;

