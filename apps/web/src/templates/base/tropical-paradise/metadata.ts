import type { TemplateMetadata } from '../types';

export const metadata: TemplateMetadata = {
  id: 'tropical-paradise',
  slug: 'tropical-paradise',
  name: 'Tropical Paradise',
  description: 'A vibrant tropical-themed wedding invitation with island vibes',
  category: 'wedding',
  tags: ['tropical', 'beach', 'summer', 'vibrant'],
  thumbnail: '/images/assets/tropical-paradise/thumbnail.png',
  preview: '/images/assets/tropical-paradise/tropical-paradise.png',
  isPremium: false,
  seo: {
    title: 'Tropical Paradise Wedding Invitation Template',
    description: 'Vibrant tropical beach wedding invitation template with island vibes. Perfect for destination weddings and summer celebrations.',
    keywords: [
      'tropical wedding invitation',
      'beach wedding template',
      'summer wedding invite',
      'island wedding',
      'destination wedding invitation',
    ],
  },
  defaultAssets: {
    colors: {
      primary: '#00BCD4', // Tropical cyan
      secondary: '#FF5722', // Sunset orange
      accent: '#4CAF50', // Palm green
      text: '#ffffff',
      highlight: '#FFEB3B', // Sunshine yellow
    },
    fonts: {
      khmer: 'font-preahvihear',
      moulpali: 'font-moulpali',
      khangkomutt: 'font-khangkomutt',
    },
    images: {
      background: '/images/assets/tropical-paradise/tropical-paradise.png',
      decorativeTopLeft: '/images/assets/tropical-paradise/frame-top-left.png',
      decorativeTopRight: '/images/assets/tropical-paradise/frame-top-right.png',
      decorativeBottomLeft: '/images/assets/tropical-paradise/frame-bottom-left.png',
      decorativeBottomRight: '/images/assets/tropical-paradise/frame-bottom-right.png',
      decorativeBorder: '/images/assets/tropical-paradise/frame-bottom.png',
      frameBtn: '/images/assets/tropical-paradise/frame-btn.png',
      frameGuestName: '/images/assets/tropical-paradise/frame-guest-name.png',
    },
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export default metadata;

