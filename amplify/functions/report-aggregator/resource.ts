import { defineFunction } from '@aws-amplify/backend';

export const reportAggregator = defineFunction({
  name: 'report-aggregator',
  entry: './handler.ts',
});
