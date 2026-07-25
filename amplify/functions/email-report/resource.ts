import { defineFunction } from '@aws-amplify/backend';

export const emailReport = defineFunction({
  name: 'email-report',
  entry: './handler.ts',
  environment: {
    SES_FROM_EMAIL: 'reports@alluvial.africa',
  },
});
