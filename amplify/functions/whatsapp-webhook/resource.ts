import { defineFunction } from '@aws-amplify/backend';

export const whatsappWebhook = defineFunction({
  name: 'whatsapp-webhook',
  entry: './handler.ts',
});
