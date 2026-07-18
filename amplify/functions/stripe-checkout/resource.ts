import { defineFunction, secret } from '@aws-amplify/backend';

export const stripeCheckout = defineFunction({
  name: 'stripe-checkout',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
  },
});
