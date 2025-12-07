import type { TemplateMetadata } from '../types';

export const metadata: TemplateMetadata = {
  id: 'modern-minimal',
  slug: 'modern-minimal',
  name: 'Modern Minimal',
  description: 'A clean and modern minimalist wedding invitation template',
  category: 'wedding',
  tags: ['modern', 'minimal', 'clean', 'elegant'],
  thumbnail: '/images/assets/modern-minimal/thumbnail.png',
  preview: '/images/assets/modern-minimal/modern-minimal.png',
  isPremium: false,
  seo: {
    title: 'Modern Minimal Wedding Invitation Template',
    description: 'Create stunning modern wedding invitations with our clean and minimalist template. Perfect for contemporary weddings with elegant design.',
    keywords: [
      'modern wedding invitation',
      'minimal wedding template',
      'clean wedding invite',
      'contemporary wedding',
      'digital wedding invitation',
    ],
  },
  defaultAssets: {
    colors: {
      accent: '#f472b6', // Soft pink for titles
      text: '#ffffff', // White for main text
      highlight: '#fbbf24', // Yellow for highlights
      emphasis: '#ef4444', // Red for emphasis
    },
    fonts: {
      khmer: 'font-preahvihear',
      moulpali: 'font-moulpali',
      khangkomutt: 'font-khangkomutt',
    },
    images: {
      background: '/images/assets/modern-minimal/modern-minimal.png',
      decorativeTopLeft: '/images/assets/modern-minimal/frame-top-left.png',
      decorativeTopRight: '/images/assets/modern-minimal/frame-top-right.png',
      decorativeBottomLeft: '/images/assets/modern-minimal/frame-bottom-left.png',
      decorativeBottomRight: '/images/assets/modern-minimal/frame-bottom-right.png',
      decorativeBorder: '/images/assets/modern-minimal/frame-bg.png',
      butterfly1: '/images/assets/butterfly1.png',
      butterfly2: '/images/assets/butterfly2.png',
      butterfly3: '/images/assets/butterfly3.png',
      frameBtn: '/images/assets/modern-minimal/frame-btn.png',
      frameGuestName: '/images/assets/modern-minimal/frame-guest-name.png',
    },
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export default metadata;

