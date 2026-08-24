import { validateBrainPermitDraft } from './brain-permit-policy';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const createOk = validateBrainPermitDraft({
  operation: 'CREATE',
  app_id: 'd73d1279-6fe6-4ed9-b1bb-ecd6fbe09a2e',
  app_role: 'SALES',
  resource: 'CONTACT',
  action: 'VIEW',
  scope: 'ORGANIZATION',
  enabled: true,
  change_reason: 'Create permit',
});
assert(createOk.ok, 'CREATE should validate');
assert(createOk.normalized.operation === 'CREATE', 'Normalized operation should remain CREATE');

const invalidOp = validateBrainPermitDraft({
  operation: 'DELETE',
  app_id: 'd73d1279-6fe6-4ed9-b1bb-ecd6fbe09a2e',
});
assert(!invalidOp.ok, 'DELETE operation must be rejected');

const updateOk = validateBrainPermitDraft({
  operation: 'UPDATE',
  permit_id: '9f84f7a6-7e6a-4d7d-958a-f76f1d1951f0',
  app_id: 'd73d1279-6fe6-4ed9-b1bb-ecd6fbe09a2e',
  app_role: 'SALES',
  resource: 'CONTACT',
  action: 'EDIT',
  scope: 'OWN',
  enabled: false,
  change_reason: 'Update permission',
});
assert(updateOk.ok, 'UPDATE should validate');

const rollbackOk = validateBrainPermitDraft({
  operation: 'ROLLBACK',
  permit_id: '9f84f7a6-7e6a-4d7d-958a-f76f1d1951f0',
  version_id: 'f8de0d0f-4715-45aa-8a5b-43c66d5a4e3c',
  app_id: 'd73d1279-6fe6-4ed9-b1bb-ecd6fbe09a2e',
});
assert(rollbackOk.ok, 'ROLLBACK should validate with permit and version');

console.log('brain-permit-policy tests passed');
