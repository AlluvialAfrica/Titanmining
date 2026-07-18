import { defineFunction, secret } from '@aws-amplify/backend';

export const otpSender = defineFunction({
  name: 'otp-sender',
  entry: './handler.ts',
  environment: {
    TWILIO_ACCOUNT_SID: secret('TWILIO_ACCOUNT_SID'),
    TWILIO_AUTH_TOKEN: secret('TWILIO_AUTH_TOKEN'),
    TWILIO_CHATWORKS_WHATSAPP_NUMBER: '+12058469763',
    TWILIO_CHATWORKS_WHATSAPP_AUTH_CONTENT_SID: secret('TWILIO_CHATWORKS_WHATSAPP_AUTH_CONTENT_SID'),
  },
});
