import { defineFunction } from '@aws-amplify/backend';

export const otpSender = defineFunction({
  name: 'otp-sender',
  entry: './handler.ts',
});
