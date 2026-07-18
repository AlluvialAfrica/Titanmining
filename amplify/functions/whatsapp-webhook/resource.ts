import { defineFunction, secret } from '@aws-amplify/backend';

export const whatsappWebhook = defineFunction({
  name: 'whatsapp-webhook',
  entry: './handler.ts',
  environment: {
    TWILIO_ACCOUNT_SID: secret('TWILIO_ACCOUNT_SID'),
    TWILIO_AUTH_TOKEN: secret('TWILIO_AUTH_TOKEN'),
    TWILIO_CHATWORKS_WHATSAPP_NUMBER: '+12058469763',
    WHATSAPP_VERIFY_TOKEN: secret('WHATSAPP_VERIFY_TOKEN'),
  },
});
