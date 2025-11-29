# Subscription & Template Purchase Implementation

## Overview

This document describes the implementation of subscription plans and template purchase functionality in the backend.

## Features Implemented

### 1. Subscription Plans System

#### Models
- **SubscriptionPlan**: Defines available subscription plans
  - Fields: name, displayName, description, price, billingCycle, maxEvents, features, isActive
  - `maxEvents: null` means unlimited events

- **UserSubscription**: Tracks user subscriptions
  - Fields: userId, planId, status, startDate, endDate, autoRenew, paymentMethod, transactionId
  - Status: 'active' | 'cancelled' | 'expired' | 'pending'

#### API Endpoints

**Subscription Plans** (`/api/subscription-plans`):
- `GET /` - List all plans (public, optional `?activeOnly=true`)
- `GET /:id` - Get plan by ID (public)
- `POST /` - Create plan (Admin only)
- `PATCH /:id` - Update plan (Admin only)
- `DELETE /:id` - Delete plan (Admin only)

**User Subscriptions** (`/api/subscriptions`):
- `GET /me` - Get current user's subscriptions
- `GET /me/active` - Get current user's active subscription
- `POST /` - Create subscription for current user
- `POST /:id/cancel` - Cancel subscription
- `GET /user/:userId` - Get subscriptions by user ID (Admin only)

### 2. Template Purchase System

#### Models
- **TemplatePurchase**: Tracks template purchases
  - Fields: userId, templateId, price, purchaseDate, paymentMethod, transactionId
  - Unique constraint on (userId, templateId) to prevent duplicate purchases

#### API Endpoints (`/api/template-purchases`):
- `GET /me` - Get current user's template purchases
- `GET /check/:templateId` - Check if user owns a template
- `POST /` - Purchase a template
- `GET /revenue` - Get total revenue from template sales (Admin only)

### 3. Event Limit Integration

The event creation limit now uses subscription plans instead of just user roles:

- **Admins**: Unlimited events
- **Users with active subscription**: Uses plan's `maxEvents` limit
- **Users without subscription**: Default limit of 5 events

## Usage Examples

### Creating a Subscription Plan (Admin)

```bash
POST /api/subscription-plans
{
  "name": "pro",
  "displayName": "Pro Plan",
  "description": "Professional plan with unlimited events",
  "price": 29.99,
  "billingCycle": "monthly",
  "maxEvents": null,  // null = unlimited
  "features": ["Unlimited events", "Premium templates", "Priority support"]
}
```

### Subscribing to a Plan

```bash
POST /api/subscriptions
{
  "planId": "plan_id_here",
  "paymentMethod": "stripe",
  "transactionId": "txn_123456",
  "autoRenew": true
}
```

### Purchasing a Template

```bash
POST /api/template-purchases
{
  "templateId": "template_id_here",
  "paymentMethod": "stripe",
  "transactionId": "txn_123456"
}
```

### Checking Template Ownership

```bash
GET /api/template-purchases/check/:templateId
Response: { "ownsTemplate": true/false }
```

## Database Schema

### SubscriptionPlan Collection
```typescript
{
  name: string (unique, lowercase)
  displayName: string
  description?: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  maxEvents: number | null
  features: string[]
  isActive: boolean
}
```

### UserSubscription Collection
```typescript
{
  userId: ObjectId (ref: User)
  planId: ObjectId (ref: SubscriptionPlan)
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  startDate: Date
  endDate: Date
  autoRenew: boolean
  paymentMethod?: string
  transactionId?: string
  cancelledAt?: Date
}
```

### TemplatePurchase Collection
```typescript
{
  userId: ObjectId (ref: User)
  templateId: ObjectId (ref: Template)
  price: number
  purchaseDate: Date
  paymentMethod?: string
  transactionId?: string
}
```

## Next Steps

1. **Payment Integration**: Integrate with payment gateway (Stripe, PayPal, etc.)
2. **Webhook Handlers**: Handle payment webhooks for subscription renewals
3. **Subscription Expiration**: Add cron job to check and expire subscriptions
4. **Revenue Analytics**: Add more detailed revenue reporting
5. **Subscription Upgrades/Downgrades**: Allow users to change plans

## Notes

- When a user subscribes, any existing active subscriptions are automatically cancelled
- Template purchases prevent duplicate purchases (unique constraint)
- Event limits are checked dynamically based on active subscription
- Admins bypass all limits

