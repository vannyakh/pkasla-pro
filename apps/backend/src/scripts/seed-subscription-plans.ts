import { connectDatabase, disconnectDatabase } from '../config/database';
import { logger } from '../utils/logger';
import { SubscriptionPlanModel } from '../modules/subscriptions/subscription-plan.model';

const subscriptionPlans = [
  {
    name: 'free',
    displayName: 'Free Plan',
    description: 'Perfect for getting started with basic event management',
    price: 0,
    billingCycle: 'monthly' as const,
    maxEvents: 3,
    features: [
      'Up to 3 events',
      'Basic templates',
      'Guest management',
      'RSVP tracking',
      'Email support',
    ],
    isActive: true,
  },
  {
    name: 'basic',
    displayName: 'Basic Plan',
    description: 'Ideal for small events and personal use',
    price: 9.99,
    billingCycle: 'monthly' as const,
    maxEvents: 10,
    features: [
      'Up to 10 events',
      'All free templates',
      'Premium templates access',
      'Unlimited guests',
      'Advanced RSVP management',
      'Custom branding',
      'Email support',
      'Basic analytics',
    ],
    isActive: true,
  },
  {
    name: 'basic-yearly',
    displayName: 'Basic Plan (Yearly)',
    description: 'Save 20% with yearly billing - Ideal for small events and personal use',
    price: 95.90, // 9.99 * 12 * 0.8 (20% discount)
    billingCycle: 'yearly' as const,
    maxEvents: 10,
    features: [
      'Up to 10 events',
      'All free templates',
      'Premium templates access',
      'Unlimited guests',
      'Advanced RSVP management',
      'Custom branding',
      'Email support',
      'Basic analytics',
      '20% savings',
    ],
    isActive: true,
  },
  {
    name: 'pro',
    displayName: 'Pro Plan',
    description: 'Best for professional event organizers and businesses',
    price: 29.99,
    billingCycle: 'monthly' as const,
    maxEvents: 50,
    features: [
      'Up to 50 events',
      'All templates (free + premium)',
      'Unlimited guests',
      'Advanced customization',
      'Priority support',
      'Advanced analytics',
      'CSV guest import',
      'Custom domain',
      'API access',
      'White-label options',
    ],
    isActive: true,
  },
  {
    name: 'pro-yearly',
    displayName: 'Pro Plan (Yearly)',
    description: 'Save 25% with yearly billing - Best for professional event organizers',
    price: 269.91, // 29.99 * 12 * 0.75 (25% discount)
    billingCycle: 'yearly' as const,
    maxEvents: 50,
    features: [
      'Up to 50 events',
      'All templates (free + premium)',
      'Unlimited guests',
      'Advanced customization',
      'Priority support',
      'Advanced analytics',
      'CSV guest import',
      'Custom domain',
      'API access',
      'White-label options',
      '25% savings',
    ],
    isActive: true,
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise Plan',
    description: 'Unlimited everything for large organizations',
    price: 99.99,
    billingCycle: 'monthly' as const,
    maxEvents: null, // Unlimited
    features: [
      'Unlimited events',
      'All templates (free + premium)',
      'Unlimited guests',
      'Full customization',
      '24/7 priority support',
      'Advanced analytics & reporting',
      'CSV guest import/export',
      'Custom domain & branding',
      'Full API access',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    isActive: true,
  },
  {
    name: 'enterprise-yearly',
    displayName: 'Enterprise Plan (Yearly)',
    description: 'Save 30% with yearly billing - Unlimited everything for large organizations',
    price: 839.92, // 99.99 * 12 * 0.7 (30% discount)
    billingCycle: 'yearly' as const,
    maxEvents: null, // Unlimited
    features: [
      'Unlimited events',
      'All templates (free + premium)',
      'Unlimited guests',
      'Full customization',
      '24/7 priority support',
      'Advanced analytics & reporting',
      'CSV guest import/export',
      'Custom domain & branding',
      'Full API access',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      '30% savings',
    ],
    isActive: true,
  },
];

const seedSubscriptionPlans = async () => {
  try {
    logger.info('Starting subscription plan seed...');
    
    // Check existing plans
    const existingCount = await SubscriptionPlanModel.countDocuments();
    if (existingCount > 0) {
      logger.info(`Found ${existingCount} existing subscription plans. Clearing...`);
      await SubscriptionPlanModel.deleteMany({});
      logger.info('✅ Cleared existing subscription plans');
    }

    // Insert subscription plans
    const insertedPlans = await SubscriptionPlanModel.insertMany(subscriptionPlans);
    logger.info(`✅ Successfully seeded ${insertedPlans.length} subscription plans`);

    // Log summary
    const monthlyPlans = insertedPlans.filter(p => p.billingCycle === 'monthly');
    const yearlyPlans = insertedPlans.filter(p => p.billingCycle === 'yearly');
    const activePlans = insertedPlans.filter(p => p.isActive);
    const freePlans = insertedPlans.filter(p => p.price === 0);
    const paidPlans = insertedPlans.filter(p => p.price > 0);
    const unlimitedPlans = insertedPlans.filter(p => p.maxEvents === null);

    logger.info('Subscription plan seed summary:');
    logger.info(`  Total: ${insertedPlans.length}`);
    logger.info(`  Monthly: ${monthlyPlans.length}`);
    logger.info(`  Yearly: ${yearlyPlans.length}`);
    logger.info(`  Active: ${activePlans.length}`);
    logger.info(`  Free: ${freePlans.length}`);
    logger.info(`  Paid: ${paidPlans.length}`);
    logger.info(`  Unlimited events: ${unlimitedPlans.length}`);
    
    logger.info('\nSeeded subscription plans:');
    insertedPlans.forEach((plan) => {
      const maxEventsText = plan.maxEvents === null ? 'Unlimited' : plan.maxEvents.toString();
      const priceText = plan.price === 0 ? 'Free' : `$${plan.price.toFixed(2)}/${plan.billingCycle}`;
      logger.info(`  - ${plan.displayName} (${plan.name})`);
      logger.info(`    Price: ${priceText} | Max Events: ${maxEventsText} | Features: ${plan.features.length}`);
    });

  } catch (error: any) {
    if (error.code === 11000) {
      logger.warn('Some subscription plans already exist (duplicate key error). Skipping duplicates.');
    } else {
      throw error;
    }
  }
};

const run = async () => {
  try {
    await connectDatabase();
    await seedSubscriptionPlans();
    logger.info('✅ Subscription plan seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Failed to seed subscription plans');
    process.exit(1);
  } finally {
    await disconnectDatabase().catch((err) =>
      logger.error({ err }, 'Failed to close database connection'),
    );
  }
};

void run();

