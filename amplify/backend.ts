import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { dailyReminder } from './functions/daily-reminder/resource';
import { reportAggregator } from './functions/report-aggregator/resource';
import { otpSender } from './functions/otp-sender/resource';
import { whatsappWebhook } from './functions/whatsapp-webhook/resource';
import { stripeCheckout } from './functions/stripe-checkout/resource';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { CfnOutput } from 'aws-cdk-lib';

const backend = defineBackend({
  auth,
  data,
  dailyReminder,
  reportAggregator,
  otpSender,
  whatsappWebhook,
  stripeCheckout,
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

// --- Table name environment variables ---
const tables = backend.data.resources.tables;

// Cast IFunction to Function to access addEnvironment
const dailyReminderFn = backend.dailyReminder.resources.lambda as LambdaFunction;
const reportAggregatorFn = backend.reportAggregator.resources.lambda as LambdaFunction;

// daily-reminder needs User + DailyReport tables
dailyReminderFn.addEnvironment('USER_TABLE_NAME', tables['User'].tableName);
dailyReminderFn.addEnvironment('REPORT_TABLE_NAME', tables['DailyReport'].tableName);

// report-aggregator needs DailyReport + FuelReconciliation + GoldRecovery tables
reportAggregatorFn.addEnvironment('REPORT_TABLE_NAME', tables['DailyReport'].tableName);
reportAggregatorFn.addEnvironment('FUEL_TABLE_NAME', tables['FuelReconciliation'].tableName);
reportAggregatorFn.addEnvironment('GOLD_TABLE_NAME', tables['GoldRecovery'].tableName);

// Create a function URL for the Stripe checkout Lambda
const stripeCheckoutFn = backend.stripeCheckout.resources.lambda as LambdaFunction;
const fnUrl = stripeCheckoutFn.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ['*'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    allowedMethods: [HttpMethod.POST] as any,
  },
});

// Output the function URL so the frontend can use it
new CfnOutput(backend.stripeCheckout.resources.lambda.stack, 'StripeCheckoutUrl', {
  value: fnUrl.url,
  description: 'Stripe Checkout Lambda Function URL',
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
