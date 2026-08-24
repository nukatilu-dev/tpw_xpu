export const MIX_STATUSES = ['CREATED', 'RUNNING', 'COMPLETED', 'TERMINATED', 'FAILED'] as const;
export type MixStatus = typeof MIX_STATUSES[number];

export const MIX_TERMINATION_REASONS = [
  'CONTRACT_ENDED',
  'USER_REQUEST',
  'ADMIN_DECISION',
  'LEGAL_PROCESS',
  'PERMIT_REVOKED',
  'RESOURCE_EXPIRED',
] as const;
export type MixTerminationReason = typeof MIX_TERMINATION_REASONS[number];

export type MixObjectType = 'APP' | 'PROJECT';
export type MixParticipantInput = { object_id: string; object_type: MixObjectType; role?: 'SOURCE' | 'TARGET' | 'ADDITIONAL'; scope_context?: Record<string, unknown> | null; database_context?: Record<string, unknown> | null };
export type MixCreateInput = {
  user_id: string;
  source_object_id: string;
  source_object_type: MixObjectType;
  target_object_id: string;
  target_object_type: MixObjectType;
  participants?: MixParticipantInput[];
  database_context?: Record<string, unknown> | null;
  scope_context?: Record<string, unknown> | null;
  permit_id?: string | null;
  contract_reference?: string | null;
  tc_usage_reference?: string | null;
  token_usage_reference?: string | null;
};

export type MixValidation = { ok: true; value: MixCreateInput } | { ok: false; errors: string[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateMixCreate(input: unknown): MixValidation {
  const candidate = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const errors: string[] = [];
  const objectType = (value: unknown): value is MixObjectType => value === 'APP' || value === 'PROJECT';
  const requiredUuid = (name: string) => {
    const value = candidate[name];
    if (typeof value !== 'string' || !UUID.test(value)) errors.push(`${name} must be a UUID`);
    return typeof value === 'string' ? value : '';
  };
  const sourceId = requiredUuid('source_object_id');
  const targetId = requiredUuid('target_object_id');
  if (!objectType(candidate.source_object_type)) errors.push('source_object_type must be APP or PROJECT');
  if (!objectType(candidate.target_object_type)) errors.push('target_object_type must be APP or PROJECT');
  if (sourceId && sourceId === targetId) errors.push('source and target objects must be distinct');
  const participants = candidate.participants === undefined ? [] : candidate.participants;
  if (!Array.isArray(participants)) errors.push('participants must be an array');
  const normalizedParticipants: MixParticipantInput[] = [];
  if (Array.isArray(participants)) {
    const seen = new Set<string>([sourceId, targetId]);
    for (let index = 0; index < participants.length; index += 1) {
      const participant = participants[index];
      if (!participant || typeof participant !== 'object') { errors.push(`participants[${index}] must be an object`); continue; }
      const row = participant as Record<string, unknown>;
      if (typeof row.object_id !== 'string' || !UUID.test(row.object_id)) errors.push(`participants[${index}].object_id must be a UUID`);
      if (!objectType(row.object_type)) errors.push(`participants[${index}].object_type must be APP or PROJECT`);
      if (typeof row.object_id === 'string' && seen.has(row.object_id)) errors.push(`participants[${index}].object_id is duplicated`);
      if (typeof row.object_id === 'string') seen.add(row.object_id);
      normalizedParticipants.push({ object_id: String(row.object_id ?? ''), object_type: row.object_type as MixObjectType, role: row.role as MixParticipantInput['role'], scope_context: row.scope_context as Record<string, unknown> | null, database_context: row.database_context as Record<string, unknown> | null });
    }
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: {
    user_id: String(candidate.user_id ?? ''), source_object_id: sourceId, source_object_type: candidate.source_object_type as MixObjectType,
    target_object_id: targetId, target_object_type: candidate.target_object_type as MixObjectType, participants: normalizedParticipants,
    database_context: candidate.database_context as Record<string, unknown> | null, scope_context: candidate.scope_context as Record<string, unknown> | null,
    permit_id: typeof candidate.permit_id === 'string' ? candidate.permit_id : null, contract_reference: typeof candidate.contract_reference === 'string' ? candidate.contract_reference : null,
    tc_usage_reference: typeof candidate.tc_usage_reference === 'string' ? candidate.tc_usage_reference : null, token_usage_reference: typeof candidate.token_usage_reference === 'string' ? candidate.token_usage_reference : null,
  } };
}

export function isMixTransitionAllowed(from: MixStatus, to: MixStatus): boolean {
  return (from === 'CREATED' && to === 'RUNNING') || (from === 'RUNNING' && ['COMPLETED', 'TERMINATED', 'FAILED'].includes(to));
}

export function isMixTerminationReason(value: unknown): value is MixTerminationReason {
  return typeof value === 'string' && (MIX_TERMINATION_REASONS as readonly string[]).includes(value);
}
