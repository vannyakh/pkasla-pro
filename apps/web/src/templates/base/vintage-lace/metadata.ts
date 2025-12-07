import type { TemplateMetadata } from '../types';

export const metadata: TemplateMetadata = {
  id: 'vintage-lace',
  slug: 'vintage-lace',
  name: 'Vintage Lace',
  description: 'A classic vintage wedding invitation with lace patterns',
  category: 'wedding',
  tags: ['vintage', 'classic', 'lace', 'traditional'],
  thumbnail: '/images/assets/vintage-lace/thumbnail.png',
  preview: '/images/assets/vintage-lace/vintage-lace.png',
  isPremium: false,
  seo: {
    title: 'Vintage Lace Wedding Invitation Template',
    description: 'Classic vintage wedding invitation with beautiful lace patterns. Perfect for traditional and timeless wedding celebrations.',
    keywords: [
      'vintage wedding invitation',
      'lace wedding template',
      'classic wedding invite',
      'traditional wedding',
      'antique wedding invitation',
    ],
  },
  defaultAssets: {
    colors: {
      primary: '#D4AF37', // Vintage gold
      secondary: '#8B7355', // Antique brown
      accent: '#F5E6D3', // Cream
      text: '#ffffff',
      highlight: '#C9A96E', // Light gold
    },
    fonts: {
      khmer: 'font-preahvihear',
      moulpali: 'font-moulpali',
      khangkomutt: 'font-khangkomutt',
    },
    images: {
      background: '/images/assets/vintage-lace/vintage-lace.png',
      decorativeTopLeft: '/images/assets/vintage-lace/frame-top-left.png',
      decorativeTopRight: '/images/assets/vintage-lace/frame-top-right.png',
      decorativeBottomLeft: '/images/assets/vintage-lace/frame-bottom-left.png',
      decorativeBottomRight: '/images/assets/vintage-lace/frame-bottom-right.png',
      decorativeBorder: '/images/assets/vintage-lace/frame-bottom.png',
      pattern: '/images/assets/lace-pattern.png',
      frameBtn: '/images/assets/vintage-lace/frame-btn.png',
      frameGuestName: '/images/assets/vintage-lace/frame-guest-name.png',
    },
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export default metadata;

