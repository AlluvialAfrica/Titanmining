import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

const backend = defineBackend({
  auth,
  data,
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
