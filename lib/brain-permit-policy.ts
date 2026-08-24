export type BrainPermitOperation = 'CREATE' | 'UPDATE' | 'ACTIVATE' | 'DEACTIVATE' | 'ROLLBACK';

export type BrainPermitDraft = {
  operation: BrainPermitOperation;
  permit_id?: string | null;
  version_id?: string | null;
  app_id?: string | null;
  app_role?: string | null;
  resource?: string | null;
  field?: string | null;
  action?: string | null;
  scope?: string | null;
  enabled?: boolean | null;
  change_reason?: string | null;
};

export type BrainPermitValidationResult = {
  ok: boolean;
  normalized: BrainPermitDraft;
  errors: string[];
};

const VALID_OPERATIONS = new Set<BrainPermitOperation>(['CREATE', 'UPDATE', 'ACTIVATE', 'DEACTIVATE', 'ROLLBACK']);

export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateBrainPermitDraft(input: unknown): BrainPermitValidationResult {
  const draft = (typeof input === 'object' && input !== null ? input as Record<string, unknown> : {});
  const operation = typeof draft.operation === 'string' ? draft.operation.toUpperCase() : '';

  const normalized: BrainPermitDraft = {
    operation: (VALID_OPERATIONS.has(operation as BrainPermitOperation) ? operation as BrainPermitOperation : 'UPDATE'),
    permit_id: typeof draft.permit_id === 'string' ? draft.permit_id : null,
    version_id: typeof draft.version_id === 'string' ? draft.version_id : null,
    app_id: typeof draft.app_id === 'string' ? draft.app_id : null,
    app_role: normalizeText(draft.app_role),
    resource: normalizeText(draft.resource),
    field: normalizeText(draft.field),
    action: normalizeText(draft.action),
    scope: normalizeText(draft.scope),
    enabled: typeof draft.enabled === 'boolean' ? draft.enabled : true,
    change_reason: typeof draft.change_reason === 'string' ? draft.change_reason.trim() : null,
  };

  const errors: string[] = [];

  if (!VALID_OPERATIONS.has(normalized.operation)) {
    errors.push('operation is invalid');
  }

  if (!normalized.app_id && normalized.operation !== 'ROLLBACK') {
    errors.push('app_id is required');
  }

  if (normalized.operation === 'CREATE' && !normalized.app_role) {
    errors.push('app_role is required');
  }

  if (normalized.operation === 'CREATE' && !normalized.resource) {
    errors.push('resource is required');
  }

  if ((normalized.operation === 'CREATE' || normalized.operation === 'UPDATE') && !normalized.action) {
    errors.push('action is required');
  }

  if ((normalized.operation === 'CREATE' || normalized.operation === 'UPDATE') && !normalized.scope) {
    errors.push('scope is required');
  }

  if ((normalized.operation === 'UPDATE' || normalized.operation === 'ACTIVATE' || normalized.operation === 'DEACTIVATE' || normalized.operation === 'ROLLBACK') && !normalized.permit_id) {
    errors.push('permit_id is required for this operation');
  }

  if ((normalized.operation === 'UPDATE' || normalized.operation === 'ACTIVATE' || normalized.operation === 'DEACTIVATE') && !normalized.app_role) {
    errors.push('app_role is required');
  }

  if ((normalized.operation === 'UPDATE' || normalized.operation === 'ACTIVATE' || normalized.operation === 'DEACTIVATE') && !normalized.resource) {
    errors.push('resource is required');
  }

  return {
    ok: errors.length === 0,
    normalized,
    errors,
  };
}
