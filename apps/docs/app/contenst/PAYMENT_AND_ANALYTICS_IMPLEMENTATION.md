# Payment Gateway & Analytics Implementation

## Overview

This document describes the implementation of payment gateway integration, webhook handlers, subscription expiration cron jobs, revenue analytics, and subscription upgrade/downgrade functionality.

## Features Implemented

### 1. Stripe Payment Gateway Integration

#### Configuration
- Added Stripe environment variables:
  - `STRIPE_SECRET_KEY` - Stripe secret key
  - `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (for frontend)
  - `STRIPE_WEBHOOK_SECRET` - Webhook secret for signature verification

#### Services
- **StripeService** (`stripe.service.ts`):
  - Create payment intents for subscriptions
  - Create payment intents for template purchases
  - Verify webhook signatures
  - Create Stripe customers
  - Manage Stripe subscriptions

#### API Endpoints
- `POST /api/v1/payments/subscription/intent` - Create payment intent for subscription
- `POST /api/v1/payments/template/intent` - Create payment intent for template purchase
- `POST /api/v1/payments/webhook/stripe` - Stripe webhook endpoint

### 2. Webhook Handlers

#### Supported Events
- `payment_intent.succeeded` - Creates subscription or template purchase on successful payment
- `payment_intent.payment_failed` - Logs failed payments
- `customer.subscription.created` - Tracks subscription creation
- `customer.subscription.updated` - Tracks subscription updates
- `customer.subscription.deleted` - Handles subscription cancellation

#### Implementation
- Webhook signature verification for security
- Automatic subscription creation on successful payment
- Automatic template purchase recording on successful payment
- Error handling and logging

### 3. Subscription Expiration Cron Job

#### Services
- **SubscriptionCronService** (`subscription-cron.service.ts`):
  - `expireSubscriptions()` - Expires subscriptions past their end date
  - `checkUpcomingExpirations()` - Finds subscriptions expiring within 7 days

#### Usage
```typescript
import { expireSubscriptionsJob, checkUpcomingExpirationsJob } from '@/modules/subscriptions/subscription-cron';

// Run daily at midnight
await expireSubscriptionsJob();

// Run daily in the morning
await checkUpcomingExpirationsJob();
```

#### Setup with Node-Cron
You can set up a cron job using `node-cron`:

```typescript
import cron from 'node-cron';
import { expireSubscriptionsJob, checkUpcomingExpirationsJob } from '@/modules/subscriptions/subscription-cron';

// Run daily at midnight
cron.schedule('0 0 * * *', expireSubscriptionsJob);

// Run daily at 9 AM
cron.schedule('0 9 * * *', checkUpcomingExpirationsJob);
```

### 4. Revenue Analytics Dashboard

#### Services
- **RevenueService** (`revenue.service.ts`):
  - `getTemplateRevenue()` - Total revenue from template purchases
  - `getSubscriptionRevenue()` - Total revenue from active subscriptions
  - `getRevenueStats()` - Comprehensive revenue statistics
  - `getRevenueByDateRange()` - Revenue for a specific date range

#### API Endpoints (Admin only)
- `GET /api/v1/analytics/revenue/stats` - Get comprehensive revenue statistics
- `GET /api/v1/analytics/revenue/range?startDate=...&endDate=...` - Get revenue by date range

#### Revenue Statistics Response
```json
{
  "totalTemplateRevenue": 1000,
  "totalSubscriptionRevenue": 5000,
  "totalRevenue": 6000,
  "templatePurchases": {
    "count": 50,
    "revenue": 1000
  },
  "activeSubscriptions": {
    "count": 20,
    "monthlyRecurring": 3000,
    "yearlyRecurring": 2000
  },
  "revenueByPeriod": {
    "today": 100,
    "thisWeek": 500,
    "thisMonth": 2000,
    "thisYear": 6000
  }
}
```

### 5. Subscription Upgrade/Downgrade

#### Features
- Users can upgrade or downgrade their subscription
- Current subscription is automatically cancelled
- New subscription is created with the selected plan
- Payment processing through Stripe

#### API Endpoint
- `POST /api/v1/subscriptions/change` - Change subscription plan
  ```json
  {
    "planId": "new_plan_id",
    "paymentMethod": "stripe",
    "transactionId": "txn_123456"
  }
  ```

## Installation

### 1. Install Stripe Package

```bash
npm install stripe
npm install --save-dev @types/stripe
```

### 2. Configure Environment Variables

Add to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Set Up Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/v1/payments/webhook/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Set Up Cron Jobs (Optional)

Install `node-cron`:

```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

Add to your server startup:

```typescript
import cron from 'node-cron';
import { expireSubscriptionsJob, checkUpcomingExpirationsJob } from '@/modules/subscriptions/subscription-cron';

// Run daily at midnight
cron.schedule('0 0 * * *', expireSubscriptionsJob);

// Run daily at 9 AM
cron.schedule('0 9 * * *', checkUpcomingExpirationsJob);
```

## Usage Examples

### Creating a Payment Intent for Subscription

```bash
POST /api/v1/payments/subscription/intent
Authorization: Bearer <token>
{
  "planId": "plan_id_here"
}

Response:
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Creating a Payment Intent for Template Purchase

```bash
POST /api/v1/payments/template/intent
Authorization: Bearer <token>
{
  "templateId": "template_id_here"
}

Response:
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Upgrading/Downgrading Subscription

```bash
POST /api/v1/subscriptions/change
Authorization: Bearer <token>
{
  "planId": "new_plan_id",
  "paymentMethod": "stripe",
  "transactionId": "txn_123456"
}
```

### Getting Revenue Statistics (Admin)

```bash
GET /api/v1/analytics/revenue/stats
Authorization: Bearer <admin_token>
```

## Frontend Integration

### Stripe Elements Setup

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Create payment intent
const response = await fetch('/api/v1/payments/subscription/intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ planId }),
});

const { clientSecret } = await response.json();

// Confirm payment
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
  },
});
```

## Security Considerations

1. **Webhook Signature Verification**: All webhooks are verified using Stripe's signature
2. **Admin-Only Endpoints**: Revenue analytics require admin role
3. **Authentication**: All payment endpoints require authentication
4. **Transaction Tracking**: All payments are tracked with transaction IDs

## Error Handling

- Payment failures are logged but don't throw errors
- Webhook processing errors are caught and logged
- Invalid payment intents return appropriate error messages
- Subscription changes validate plan existence

## Testing

### Test Webhook Locally

Use Stripe CLI:

```bash
stripe listen --forward-to localhost:4000/api/v1/payments/webhook/stripe
```

### Test Payment Flow

1. Create a payment intent
2. Use Stripe test cards (e.g., `4242 4242 4242 4242`)
3. Verify webhook events are received
4. Check database for created subscriptions/purchases

## Next Steps

1. **Email Notifications**: Send emails on subscription expiration reminders
2. **Refund Handling**: Add refund webhook handlers
3. **Invoice Generation**: Generate invoices for subscriptions
4. **Payment Methods**: Allow users to save payment methods
5. **Subscription Proration**: Handle prorated charges on upgrades/downgrades

