# Backend Analysis: Subscription Plans & Template Purchases

## Current State

### ✅ What Exists

1. **Templates Module** (`/modules/t/`)
   - Templates have `price` and `isPremium` fields
   - CRUD operations for templates
   - Template listing with filters (category, premium status, search)
   - No purchase/tracking logic

2. **Event Creation Limit**
   - Basic users (role: 'user') are limited to 5 events
   - Error message suggests upgrading account
   - No actual upgrade mechanism exists

3. **User Model**
   - Has `role` field ('admin' | 'user')
   - No subscription-related fields

### ❌ What's Missing

## 1. Subscription Plans System

### Missing Components:
- **Subscription Model**: No database model for subscriptions
- **Subscription Plans**: No predefined plans (Basic, Pro, Premium, etc.)
- **User Subscription Tracking**: No way to track which plan a user has
- **Subscription Status**: No active/cancelled/expired status tracking
- **Payment Integration**: No payment gateway integration
- **Subscription Endpoints**: No API endpoints for:
  - Listing available plans
  - Subscribing to a plan
  - Upgrading/downgrading plans
  - Cancelling subscriptions
  - Checking subscription status

### Required Implementation:

```typescript
// Subscription Plan Model
interface SubscriptionPlan {
  id: string;
  name: string; // 'basic', 'pro', 'premium'
  price: number;
  billingCycle: 'monthly' | 'yearly';
  maxEvents: number | null; // null = unlimited
  features: string[];
  isActive: boolean;
}

// User Subscription Model
interface UserSubscription {
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod?: string;
}
```

### Integration Points:
- Update `UserDocument` to include `subscriptionId` or `subscriptionPlan`
- Modify event creation limit check to use subscription instead of role
- Add subscription middleware to check plan limits

## 2. Template Purchase System

### Missing Components:
- **Purchase Model**: No way to track template purchases
- **Purchase History**: No record of who bought what templates
- **Ownership Tracking**: No way to check if user owns a template
- **Payment Processing**: No payment integration for template purchases
- **Purchase Endpoints**: No API endpoints for:
  - Purchasing a template
  - Checking if user owns a template
  - Listing purchased templates
  - Purchase history

### Required Implementation:

```typescript
// Template Purchase Model
interface TemplatePurchase {
  userId: string;
  templateId: string;
  price: number;
  purchaseDate: Date;
  paymentMethod?: string;
  transactionId?: string;
}
```

### Integration Points:
- Add purchase check before allowing template usage
- Track revenue from template sales
- Prevent duplicate purchases

## 3. Revenue Tracking

### Missing Components:
- **Transaction Model**: No transaction history
- **Revenue Analytics**: No way to track earnings
- **Payment Records**: No payment tracking

## Recommendations

### Priority 1: Subscription System
1. Create `SubscriptionPlan` model and service
2. Create `UserSubscription` model to track user subscriptions
3. Update User model to include subscription reference
4. Modify event limit check to use subscription plan limits
5. Create subscription management endpoints

### Priority 2: Template Purchase System
1. Create `TemplatePurchase` model
2. Add purchase endpoint
3. Add ownership verification middleware
4. Update template access logic to check ownership

### Priority 3: Payment Integration
1. Integrate payment gateway (Stripe, PayPal, etc.)
2. Create transaction model
3. Add webhook handlers for payment events
4. Implement revenue tracking

## Current Event Limit Logic

The current implementation in `event.controller.ts`:
- Checks if user role is 'user' (basic user)
- Limits to 5 events
- Suggests upgrading but no upgrade path exists

**This should be changed to:**
- Check user's subscription plan
- Use plan's `maxEvents` limit
- Allow admins and premium subscribers unlimited events

