import type { TemplateMetadata } from '../types';

export const metadata: TemplateMetadata = {
  id: 'corporate-professional',
  slug: 'corporate-professional',
  name: 'Corporate Professional',
  description: 'A clean and professional corporate event invitation',
  category: 'corporate',
  tags: ['corporate', 'professional', 'business', 'modern'],
  thumbnail: '/images/assets/corporate-professional/thumbnail.png',
  preview: '/images/assets/corporate-professional/corporate-professional.png',
  isPremium: false,
  seo: {
    title: 'Corporate Professional Event Invitation Template',
    description: 'Professional corporate event invitation template with clean business design. Perfect for conferences, seminars, and business events.',
    keywords: [
      'corporate event invitation',
      'business event template',
      'professional invite',
      'corporate meeting invitation',
      'business conference invite',
    ],
  },
  defaultAssets: {
    colors: {
      primary: '#1976D2', // Professional blue
      secondary: '#0D47A1', // Dark blue
      accent: '#64B5F6', // Light blue
      text: '#ffffff',
      highlight: '#2196F3', // Blue
      emphasis: '#0288D1', // Darker blue
    },
    fonts: {
      khmer: 'font-preahvihear',
      moulpali: 'font-moulpali',
      khangkomutt: 'font-khangkomutt',
    },
    images: {
      background: '/images/assets/corporate-professional/corporate-professional.png',
      decorativeTopLeft: '/images/assets/corporate-professional/frame-top-left.png',
      decorativeTopRight: '/images/assets/corporate-professional/frame-top-right.png',
      decorativeBottomLeft: '/images/assets/corporate-professional/frame-bottom-left.png',
      decorativeBottomRight: '/images/assets/corporate-professional/frame-bottom-right.png',
      decorativeBorder: '/images/assets/corporate-professional/frame-bottom.png',
      frameBtn: '/images/assets/corporate-professional/frame-btn.png',
      frameGuestName: '/images/assets/corporate-professional/frame-guest-name.png',
    },
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export default metadata;

