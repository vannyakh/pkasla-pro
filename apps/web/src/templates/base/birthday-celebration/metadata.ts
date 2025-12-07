import type { TemplateMetadata } from '../types';

export const metadata: TemplateMetadata = {
  id: 'birthday-celebration',
  slug: 'birthday-celebration',
  name: 'Birthday Celebration',
  description: 'A fun and colorful birthday party invitation',
  category: 'birthday',
  tags: ['birthday', 'celebration', 'party', 'fun'],
  thumbnail: '/images/assets/birthday-celebration/thumbnail.png',
  preview: '/images/assets/birthday-celebration/birthday-celebration.png',
  isPremium: false,
  seo: {
    title: 'Birthday Celebration Party Invitation Template',
    description: 'Fun and colorful birthday party invitation template. Perfect for all ages and celebration styles.',
    keywords: [
      'birthday invitation',
      'party invitation template',
      'birthday celebration',
      'digital birthday invite',
      'birthday party card',
    ],
  },
  defaultAssets: {
    colors: {
      primary: '#FF6B6B', // Party red
      secondary: '#4ECDC4', // Teal
      accent: '#FFE66D', // Yellow
      text: '#ffffff',
      highlight: '#95E1D3', // Mint
      emphasis: '#F38181', // Coral
    },
    fonts: {
      khmer: 'font-preahvihear',
      moulpali: 'font-moulpali',
      khangkomutt: 'font-khangkomutt',
    },
    images: {
      background: '/images/assets/birthday-celebration/birthday-celebration.png',
      decorativeTopLeft: '/images/assets/birthday-celebration/frame-top-left.png',
      decorativeTopRight: '/images/assets/birthday-celebration/frame-top-right.png',
      decorativeBottomLeft: '/images/assets/birthday-celebration/frame-bottom-left.png',
      decorativeBottomRight: '/images/assets/birthday-celebration/frame-bottom-right.png',
      decorativeBorder: '/images/assets/birthday-celebration/frame-bottom.png',
      frameBtn: '/images/assets/birthday-celebration/frame-btn.png',
      frameGuestName: '/images/assets/birthday-celebration/frame-guest-name.png',
    },
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export default metadata;

