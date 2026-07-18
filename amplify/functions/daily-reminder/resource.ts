import { defineFunction, secret } from '@aws-amplify/backend';

export const dailyReminder = defineFunction({
  name: 'daily-reminder',
  entry: './handler.ts',
  environment: {
    TWILIO_ACCOUNT_SID: secret('TWILIO_ACCOUNT_SID'),
    TWILIO_AUTH_TOKEN: secret('TWILIO_AUTH_TOKEN'),
    TWILIO_CHATWORKS_WHATSAPP_NUMBER: '+12058469763',
    TWILIO_REMINDER_CONTENT_SID: secret('TWILIO_REMINDER_CONTENT_SID'),
  },
});
