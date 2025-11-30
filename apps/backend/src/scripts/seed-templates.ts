import { connectDatabase, disconnectDatabase } from '../config/database';
import { logger } from '../utils/logger';
import { TemplateModel } from '../modules/t/template.model';

const templates = [
  {
    name: 'classic-gold',
    title: 'Classic Gold Elegance',
    category: 'Wedding',
    price: 0,
    isPremium: false,
    slug: 'classic-gold',
    variables: [
      'event.title',
      'event.description',
      'event.date',
      'event.venue',
      'event.googleMapLink',
      'guest.name',
      'guest.email',
    ],
    assets: {
      images: ['background', 'decoration'],
      colors: ['primary', 'secondary', 'accent'],
      fonts: ['heading', 'body'],
    },
    previewImage: undefined, // Can be set later
  },
  {
    name: 'modern-minimal',
    title: 'Modern Minimalist',
    category: 'Wedding',
    price: 0,
    isPremium: false,
    slug: 'modern-minimal',
    variables: [
      'event.title',
      'event.description',
      'event.date',
      'event.venue',
      'event.googleMapLink',
      'guest.name',
      'guest.email',
    ],
    assets: {
      images: [],
      colors: ['primary', 'accent'],
      fonts: ['heading', 'body'],
    },
    previewImage: undefined,
  },
  {
    name: 'elegant-rose',
    title: 'Elegant Rose Garden',
    category: 'Wedding',
    price: 29.99,
    isPremium: true,
    slug: 'elegant-rose',
    variables: [
      'event.title',
      'event.description',
      'event.date',
      'event.venue',
      'event.googleMapLink',
      'guest.name',
      'guest.email',
      'event.dressCode',
    ],
    assets: {
      images: ['background', 'rose-pattern', 'border'],
      colors: ['primary', 'secondary', 'accent', 'rose'],
      fonts: ['heading', 'body', 'script'],
    },
    previewImage: undefined,
  },
  {
    name: 'vintage-lace',
    title: 'Vintage Lace',
    category: 'Wedding',
    price: 39.99,
    isPremium: true,
    slug: 'vintage-lace',
    variables: [
      'event.title',
      'event.description',
      'event.date',
      'event.venue',
      'guest.name',
      'guest.email',
    ],
    assets: {
      images: ['background', 'lace-pattern'],
      colors: ['primary', 'secondary', 'cream'],
      fonts: ['heading', 'body', 'elegant'],
    },
    previewImage: undefined,
  },
  {
    name: 'tropical-paradise',
    title: 'Tropical Paradise',
    category: 'Wedding',
    price: 24.99,
    isPremium: true,
    slug: 'tropical-paradise',
    variables: [
      'event.title',
      'event.description',
      'event.date',
      'event.venue',
      'event.googleMapLink',
      'guest.name',
      'guest.email',
    ],
    assets: {
      images: ['background', 'palm-leaves', 'flowers'],
      colors: ['primary', 'secondary', 'tropical-blue', 'tropical-green'],
      fonts: ['heading', 'body'],
    },
    previewImage: undefined,
  },
  {
    name: 'corporate-professional',
    title: 'Corporate Professional',
    category: 'Business',
    price: 0,
    isPremium: false,
    slug: 'corporate-professional',
    variables: [
      'event.title',
      'event.description',
      'event.date',
      'event.venue',
      'event.googleMapLink',
      'guest.name',
      'guest.email',
      'guest.company',
    ],
    assets: {
      images: [],
      colors: ['primary', 'secondary', 'accent'],
      fonts: ['heading', 'body'],
    },
    previewImage: undefined,
  },
  {
    name: 'birthday-celebration',
    title: 'Birthday Celebration',
    category: 'Birthday',
    price: 0,
    isPremium: false,
    slug: 'birthday-celebration',
    variables: [
      'event.title',
      'event.description',
      'event.date',
      'event.venue',
      'guest.name',
      'guest.email',
      'guest.age',
    ],
    assets: {
      images: ['background', 'balloons', 'confetti'],
      colors: ['primary', 'secondary', 'accent', 'celebration'],
      fonts: ['heading', 'body', 'fun'],
    },
    previewImage: undefined,
  },
  {
    name: 'anniversary-romance',
    title: 'Anniversary Romance',
    category: 'Anniversary',
    price: 19.99,
    isPremium: true,
    slug: 'anniversary-romance',
    variables: [
      'event.title',
      'event.description',
      'event.date',
      'event.venue',
      'guest.name',
      'guest.email',
      'event.years',
    ],
    assets: {
      images: ['background', 'hearts', 'roses'],
      colors: ['primary', 'secondary', 'romantic-pink', 'romantic-red'],
      fonts: ['heading', 'body', 'script'],
    },
    previewImage: undefined,
  },
];

const seedTemplates = async () => {
  try {
    logger.info('Starting template seed...');
    
    // Clear existing templates (optional - comment out if you want to keep existing)
    const existingCount = await TemplateModel.countDocuments();
    if (existingCount > 0) {
      logger.info(`Found ${existingCount} existing templates. Clearing...`);
      await TemplateModel.deleteMany({});
      logger.info('✅ Cleared existing templates');
    }

    // Insert templates
    const insertedTemplates = await TemplateModel.insertMany(templates);
    logger.info(`✅ Successfully seeded ${insertedTemplates.length} templates`);

    // Log summary
    const premiumCount = insertedTemplates.filter(t => t.isPremium).length;
    const freeCount = insertedTemplates.length - premiumCount;
    const categories = [...new Set(insertedTemplates.map(t => t.category).filter(Boolean))];

    logger.info('Template seed summary:');
    logger.info(`  Total: ${insertedTemplates.length}`);
    logger.info(`  Premium: ${premiumCount}`);
    logger.info(`  Free: ${freeCount}`);
    logger.info(`  Categories: ${categories.join(', ')}`);
    logger.info('\nSeeded templates:');
    insertedTemplates.forEach((template) => {
      logger.info(`  - ${template.name} (${template.slug}) - ${template.isPremium ? 'Premium' : 'Free'}`);
    });

  } catch (error: any) {
    if (error.code === 11000) {
      logger.warn('Some templates already exist (duplicate key error). Skipping duplicates.');
    } else {
      throw error;
    }
  }
};

const run = async () => {
  try {
    await connectDatabase();
    await seedTemplates();
    logger.info('✅ Template seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Failed to seed templates');
    process.exit(1);
  } finally {
    await disconnectDatabase().catch((err) =>
      logger.error({ err }, 'Failed to close database connection'),
    );
  }
};

void run();

