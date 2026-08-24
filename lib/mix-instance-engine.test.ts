import { isMixTerminationReason, isMixTransitionAllowed, validateMixCreate } from './mix-instance-engine';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const appId = '11111111-1111-4111-8111-111111111111';
const projectId = '22222222-2222-4222-8222-222222222222';
const additionalId = '33333333-3333-4333-8333-333333333333';

const valid = validateMixCreate({
  user_id: '44444444-4444-4444-8444-444444444444',
  source_object_id: appId,
  source_object_type: 'APP',
  target_object_id: projectId,
  target_object_type: 'PROJECT',
  participants: [{ object_id: additionalId, object_type: 'APP', role: 'ADDITIONAL' }],
  database_context: { binding: 'shared-db', scope: 'tenant-a' },
});
assert(valid.ok, 'valid App/Project MIX should validate');
assert(valid.ok && valid.value.participants?.length === 1, 'additional participants should be preserved');

const duplicate = validateMixCreate({
  user_id: '44444444-4444-4444-8444-444444444444',
  source_object_id: appId,
  source_object_type: 'APP',
  target_object_id: projectId,
  target_object_type: 'PROJECT',
  participants: [{ object_id: appId, object_type: 'APP' }],
});
assert(!duplicate.ok, 'duplicate participant should be rejected');

assert(isMixTransitionAllowed('CREATED', 'RUNNING'), 'created MIX should start');
assert(isMixTransitionAllowed('RUNNING', 'COMPLETED'), 'running MIX should complete');
assert(isMixTransitionAllowed('RUNNING', 'TERMINATED'), 'running MIX should terminate');
assert(!isMixTransitionAllowed('COMPLETED', 'RUNNING'), 'completed MIX must not restart');
assert(isMixTerminationReason('USER_REQUEST'), 'USER_REQUEST should be canonical');
assert(isMixTerminationReason('RESOURCE_EXPIRED'), 'RESOURCE_EXPIRED should be canonical');
assert(!isMixTerminationReason('OTHER'), 'OTHER must not be accepted');

console.log('mix-instance-engine tests passed');
