import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { dailyReminder } from './functions/daily-reminder/resource';
import { reportAggregator } from './functions/report-aggregator/resource';
import { otpSender } from './functions/otp-sender/resource';
import { whatsappWebhook } from './functions/whatsapp-webhook/resource';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  dailyReminder,
  reportAggregator,
  otpSender,
  whatsappWebhook,
});

// Grant Lambda functions access to DynamoDB tables
const dataStack = backend.data.resources.tables;
const tableArns = Object.values(dataStack).map((table: any) => table.tableArn);

const dynamoPolicy = new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'dynamodb:Scan',
    'dynamodb:Query',
    'dynamodb:GetItem',
    'dynamodb:PutItem',
    'dynamodb:UpdateItem',
  ],
  resources: [...tableArns, ...tableArns.map((arn: string) => `${arn}/index/*`)],
});

backend.dailyReminder.resources.lambda.addToRolePolicy(dynamoPolicy);
backend.reportAggregator.resources.lambda.addToRolePolicy(dynamoPolicy);

// Grant OTP sender SNS permissions for SMS fallback
backend.otpSender.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['sns:Publish'],
    resources: ['*'],
  })
);

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
