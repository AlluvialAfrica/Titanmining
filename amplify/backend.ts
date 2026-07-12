import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { otpSender } from './functions/otp-sender/resource';
import { dailyReminder } from './functions/daily-reminder/resource';
import { whatsappWebhook } from './functions/whatsapp-webhook/resource';
import { reportAggregator } from './functions/report-aggregator/resource';
import { CfnDomain } from 'aws-cdk-lib/aws-amplify';

const backend = defineBackend({
  auth,
  data,
  storage,
  otpSender,
  dailyReminder,
  whatsappWebhook,
  reportAggregator,
});

// Configure custom Cognito User Pool attributes using CDK schema overrides
const cfnUserPool = backend.auth.resources.cfnResources.cfnUserPool;
cfnUserPool.schema = [
  ...(cfnUserPool.schema as any || []),
  {
    name: 'role',
    attributeDataType: 'String',
    mutable: true,
    required: false,
  },
  {
    name: 'orgId',
    attributeDataType: 'String',
    mutable: true,
    required: false,
  },
  {
    name: 'siteId',
    attributeDataType: 'String',
    mutable: true,
    required: false,
  },
  {
    name: 'shift',
    attributeDataType: 'String',
    mutable: true,
    required: false,
  },
  {
    name: 'machine',
    attributeDataType: 'String',
    mutable: true,
    required: false,
  },
  {
    name: 'language',
    attributeDataType: 'String',
    mutable: true,
    required: false,
  },
  {
    name: 'status',
    attributeDataType: 'String',
    mutable: true,
    required: false,
  },
];

// Define custom CDK resources for the custom domain association on AWS Amplify
const customDomainStack = backend.createStack('CustomDomainStack');
new CfnDomain(customDomainStack, 'AlluvialAfricaDomain', {
  appId: 'd29qwdlmuy3blg',
  domainName: 'alluvial.africa',
  subDomainSettings: [
    {
      prefix: '',
      branchName: 'main',
    },
    {
      prefix: 'www',
      branchName: 'main',
    },
  ],
});
