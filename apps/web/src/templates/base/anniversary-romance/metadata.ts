import type { TemplateMetadata } from '../types';

export const metadata: TemplateMetadata = {
  id: 'anniversary-romance',
  slug: 'anniversary-romance',
  name: 'Anniversary Romance',
  description: 'A romantic anniversary celebration invitation',
  category: 'anniversary',
  tags: ['anniversary', 'romance', 'celebration', 'love'],
  thumbnail: '/images/assets/anniversary-romance/thumbnail.png',
  preview: '/images/assets/anniversary-romance/anniversary-romance.png',
  isPremium: false,
  seo: {
    title: 'Anniversary Romance Celebration Invitation Template',
    description: 'Romantic anniversary celebration invitation template. Perfect for milestone anniversaries and love celebrations.',
    keywords: [
      'anniversary invitation',
      'romantic anniversary',
      'wedding anniversary invitation',
      'anniversary celebration',
      'love anniversary invite',
    ],
  },
  defaultAssets: {
    colors: {
      primary: '#E74C3C', // Romantic red
      secondary: '#C0392B', // Deep red
      accent: '#F1948A', // Light rose
      text: '#ffffff',
      highlight: '#EC7063', // Coral red
      emphasis: '#A93226', // Dark red
    },
    fonts: {
      khmer: 'font-preahvihear',
      moulpali: 'font-moulpali',
      khangkomutt: 'font-khangkomutt',
    },
    images: {
      background: '/images/assets/anniversary-romance/anniversary-romance.png',
      decorativeTopLeft: '/images/assets/anniversary-romance/frame-top-left.png',
      decorativeTopRight: '/images/assets/anniversary-romance/frame-top-right.png',
      decorativeBottomLeft: '/images/assets/anniversary-romance/frame-bottom-left.png',
      decorativeBottomRight: '/images/assets/anniversary-romance/frame-bottom-right.png',
      decorativeBorder: '/images/assets/anniversary-romance/frame-bottom.png',
      frameBtn: '/images/assets/anniversary-romance/frame-btn.png',
      frameGuestName: '/images/assets/anniversary-romance/frame-guest-name.png',
    },
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export default metadata;

