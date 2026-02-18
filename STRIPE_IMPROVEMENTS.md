# Stripe Subscription Improvements

This document outlines the improvements made to the Stripe subscription integration.

## Changes Made

### 1. Database Schema Updates
- Added `stripeCustomerId` field to `Organization` model (optional, unique)
- Added `stripeSubscriptionId` field to `Organization` model (optional, unique)

**Migration Required:**
```bash
# For development (quick sync)
npm run db:push

# For production (creates migration)
npm run db:migrate
```

### 2. Updated API Routes

#### `app/api/stripe/create-checkout/route.ts`
- Now creates or retrieves Stripe customer before checkout
- Stores `stripeCustomerId` in database
- Uses helper function for cleaner line item creation

#### `app/api/stripe/webhook/route.ts`
- Properly stores `stripeCustomerId` and `stripeSubscriptionId` on checkout completion
- Handles `customer.subscription.deleted` - downgrades to FREE tier
- Handles `customer.subscription.updated` - updates subscription ID
- Handles `invoice.payment_failed` - logs payment failures

#### `app/api/stripe/billing-portal/route.ts`
- Now uses stored `stripeCustomerId` from database
- Returns error if no customer found

#### `app/api/stripe/cancel-subscription/route.ts`
- Actually cancels Stripe subscription using stored `stripeSubscriptionId`
- Updates database to FREE tier and clears subscription ID

#### `app/api/stripe/upgrade/route.ts`
- Uses existing customer for upgrades
- Updates existing subscription instead of creating new checkout (if subscription exists)
- Supports both price IDs and dynamic price_data

### 3. Enhanced Stripe Configuration

#### `lib/stripe.ts`
- Added support for pre-created Stripe Price IDs via environment variables
- Added `getLineItemForTier()` helper function
- Falls back to `price_data` if price IDs not configured

## Environment Variables

Add these optional environment variables for production (recommended):

```env
# Stripe Price IDs (optional - for production)
# Create products/prices in Stripe Dashboard, then add the price IDs here
STRIPE_PRICE_ID_GROWTH=price_xxxxx
STRIPE_PRICE_ID_PRO=price_xxxxx
```

**How to get Price IDs:**
1. Go to Stripe Dashboard → Products
2. Create products for "Growth Plan" and "Pro Plan"
3. Create monthly recurring prices for each
4. Copy the Price ID (starts with `price_`)
5. Add to your `.env` file

## Benefits

1. **Proper Subscription Tracking**: Can now look up organizations by Stripe customer ID
2. **Complete Lifecycle Management**: Handles subscription creation, updates, and cancellations
3. **Working Billing Portal**: Users can manage their subscriptions through Stripe's billing portal
4. **Payment Failure Handling**: Logs payment failures for monitoring
5. **Production Ready**: Supports pre-created price IDs for better Stripe dashboard management

## Webhook Events Handled

- `checkout.session.completed` - Stores customer and subscription IDs
- `customer.subscription.deleted` - Downgrades to FREE tier
- `customer.subscription.updated` - Updates subscription ID
- `invoice.payment_failed` - Logs payment failures

## Next Steps

1. **Run Database Migration:**
   ```bash
   npm run db:push  # Development
   # or
   npm run db:migrate  # Production
   ```

2. **Update Stripe Webhook (if needed):**
   - Ensure your webhook endpoint is configured in Stripe Dashboard
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
     - `invoice.payment_failed`

3. **Create Stripe Products/Prices (Optional but Recommended):**
   - Create products in Stripe Dashboard
   - Create monthly recurring prices
   - Add price IDs to `.env` file

4. **Test the Integration:**
   - Test subscription creation
   - Test subscription cancellation
   - Test billing portal access
   - Test webhook events

## Important Notes

- **No manual subscription creation needed**: Stripe automatically creates subscriptions when checkout sessions complete
- **Customer creation**: Customers are automatically created on first checkout attempt
- **Backward compatible**: Existing code will continue to work with dynamic `price_data` if price IDs are not configured
- **Database migration**: Make sure to run the migration before deploying to production
