import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'amplifySharedStorage',
  access: (allow) => ({
    'profile-pictures/{entity_id}/*': [
      allow.guest.to(['read']),
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'receipts/*': [
      allow.authenticated.to(['read', 'write']),
      allow.groups(['SiteControllers']).to(['read', 'write', 'delete']),
    ],
    'images/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write']),
    ],
  }),
});
