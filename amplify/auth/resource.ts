import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    phone: true,
  },
  userAttributes: {
    role: {
      dataType: 'String',
      mutable: true,
    },
    orgId: {
      dataType: 'String',
      mutable: false,
    },
    siteId: {
      dataType: 'String',
      mutable: true,
    },
    shift: {
      dataType: 'String',
      mutable: true,
    },
    machine: {
      dataType: 'String',
      mutable: true,
    },
    language: {
      dataType: 'String',
      mutable: true,
    },
    status: {
      dataType: 'String',
      mutable: true,
    },
  },
  groups: [
    'SiteControllers',
    'DepartmentLeads',
    'Operators',
    'SupportStaff',
    'Security',
  ],
});
