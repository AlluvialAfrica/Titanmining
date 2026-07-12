import { defineFunction } from '@aws-amplify/backend';

export const dailyReminder = defineFunction({
  name: 'daily-reminder',
  entry: './handler.ts',
});
