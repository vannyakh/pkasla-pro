import type { TemplateMetadata } from '../types';

export const metadata: TemplateMetadata = {
  id: 'elegant-rose',
  slug: 'elegant-rose',
  name: 'Elegant Rose',
  description: 'A romantic and elegant rose-themed wedding invitation',
  category: 'wedding',
  tags: ['elegant', 'romantic', 'rose', 'floral'],
  thumbnail: '/images/assets/elegant-rose/thumbnail.png',
  preview: '/images/assets/elegant-rose/elegant-rose.png',
  isPremium: false,
  seo: {
    title: 'Elegant Rose Wedding Invitation Template',
    description: 'Beautiful rose-themed wedding invitation template with romantic floral designs. Perfect for elegant and classic weddings.',
    keywords: [
      'rose wedding invitation',
      'elegant wedding template',
      'romantic wedding invite',
      'floral wedding invitation',
      'rose theme wedding',
    ],
  },
  defaultAssets: {
    colors: {
      primary: '#E91E63', // Deep pink
      secondary: '#C2185B', // Darker pink
      accent: '#F8BBD0', // Light pink
      rose: '#FF69B4', // Bright rose
      text: '#ffffff', // White for main text
      highlight: '#FFB6C1', // Light pink highlight
    },
    fonts: {
      khmer: 'font-preahvihear',
      moulpali: 'font-moulpali',
      khangkomutt: 'font-khangkomutt',
    },
    images: {
      background: '/images/assets/elegant-rose/elegant-rose.png',
      decorativeTopLeft: '/images/assets/elegant-rose/frame-top-left.png',
      decorativeTopRight: '/images/assets/elegant-rose/frame-top-right.png',
      decorativeBottomLeft: '/images/assets/elegant-rose/frame-bottom-left.png',
      decorativeBottomRight: '/images/assets/elegant-rose/frame-bottom-right.png',
      decorativeBorder: '/images/assets/elegant-rose/frame-bottom.png',
      pattern: '/images/assets/rose-pattern.png',
      frameBtn: '/images/assets/elegant-rose/frame-btn.png',
      frameGuestName: '/images/assets/elegant-rose/frame-guest-name.png',
    },
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export default metadata;

