# Stripe Payment Integration Plan

This plan outlines the steps to integrate Stripe for handling the $29 "Elite Access" subscription. We will transition from the current manual activation to a secure, automated Stripe checkout flow.

## User Review Required

> [!IMPORTANT]
> You will need to provide the following Stripe API keys in your `.env` file once the implementation is ready:
> - `STRIPE_SECRET_KEY`
> - `STRIPE_PUBLISHABLE_KEY`
> - `STRIPE_WEBHOOK_SECRET`

> [!NOTE]
> The current business logic provides a **10-day access period**. The integration will be set up as a "one-time payment" that expires after 10 days, matching your current UI design.

## Proposed Changes

### Backend (Django)

#### [MODIFY] [requirements.txt](file:///c:/Users/Alvi/Downloads/do_what_works/backend/requirements.txt)
- Add `stripe` dependency.

#### [MODIFY] [models.py](file:///c:/Users/Alvi/Downloads/do_what_works/backend/accounts/models.py)
- Update `Subscription` model to include:
    - `stripe_customer_id` (String)
    - `stripe_checkout_session_id` (String)
    - `payment_status` (Choice field: pending, paid, failed)

#### [MODIFY] [views.py](file:///c:/Users/Alvi/Downloads/do_what_works/backend/accounts/views.py)
- **`CreateStripeCheckoutView`**: New view to initialize a Stripe Checkout session.
- **`StripeWebhookView`**: New public view to handle events from Stripe (e.g., `checkout.session.completed`).
- **`SubscriptionView`**: Ensure it returns the latest status based on payment and expiration.
- **`ActivateSubscriptionView`**: Deprecate or protect this as it was for manual testing.

#### [MODIFY] [urls.py](file:///c:/Users/Alvi/Downloads/do_what_works/backend/accounts/urls.py)
- Register the new Stripe views.

---

### Frontend (React)

#### [MODIFY] [package.json](file:///c:/Users/Alvi/Downloads/do_what_works/frontend/package.json)
- Add `@stripe/stripe-js` dependency.

#### [MODIFY] [AccessContext.tsx](file:///c:/Users/Alvi/Downloads/do_what_works/frontend/src/components/AccessContext.tsx)
- Update `subscribe` function to call the backend for a Checkout Session URL and redirect the user.

#### [MODIFY] [Subscription.tsx](file:///c:/Users/Alvi/Downloads/do_what_works/frontend/src/pages/Subscription.tsx)
- Update the "Initialize Stripe Checkout" button logic to trigger the new flow.

#### [MODIFY] [Success.tsx](file:///c:/Users/Alvi/Downloads/do_what_works/frontend/src/pages/Success.tsx)
- Polish the success page to better reflect that the "Elite Protocol" is now active.

---

## Open Questions

- **One-time vs Subscription:** Do you want this to be a one-time $29 payment for 10 days, or a recurring subscription every 10 days? (Current plan assumes one-time payment as per UI).
- **Stripe Account:** Do you have a Stripe account ready for testing? If not, I can set up the code to work with test keys.

## Verification Plan

### Automated Tests
- Test the webhook endpoint using the Stripe CLI (`stripe listen --forward-to localhost:8000/api/v1/auth/stripe/webhook/`).
- Verify that subcription status updates in the DB after a successful simulated payment.

### Manual Verification
- Trigger the checkout flow from the UI.
- Complete a test payment on the Stripe Checkout page.
- Verify redirect back to the app and the "Elite Status" badge appearing.
