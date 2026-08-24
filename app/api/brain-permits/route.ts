import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { resolveTrustedRole } from '@/lib/portal-authorization';
import { validateBrainPermitDraft } from '@/lib/brain-permit-policy';

type PermitOperation = 'CREATE' | 'UPDATE' | 'ACTIVATE' | 'DEACTIVATE' | 'ROLLBACK';

type PermitVersionRow = {
  id: string;
  permit_id: string;
  version: number;
  resource: string;
  field: string | null;
  action: string;
  scope: string;
  enabled: boolean;
  operation: PermitOperation;
  changed_by: string;
  created_at: string;
  change_reason: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
};

function parseJsonBody(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function getClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {}
        },
      },
    }
  );
}

async function fetchPermitById(supabase: ReturnType<typeof getClient>, permitId: string) {
  const { data, error } = await supabase
    .from('brain_permits')
    .select('*')
    .eq('id', permitId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

async function fetchCurrentVersion(supabase: ReturnType<typeof getClient>, permitId: string, permitVersionId?: string | null) {
  const query = supabase
    .from('brain_permit_versions')
    .select('*')
    .eq('permit_id', permitId)
    .order('version', { ascending: false });

  const { data, error } = permitVersionId
    ? await query.eq('id', permitVersionId).maybeSingle()
    : await query.limit(1).maybeSingle();

  if (error) throw new Error(error.message);
  return data as PermitVersionRow | null;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown> | null = null;
  try {
    payload = parseJsonBody(await request.json());
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json({ error: 'Request body must be an object.' }, { status: 400 });
  }

  const validation = validateBrainPermitDraft(payload);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.errors.join('; ') }, { status: 400 });
  }

  const { normalized } = validation;
  const supabase = getClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = resolveTrustedRole((profile as { role?: string } | null)?.role);
  if (role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden: only SUPER_ADMIN may mutate Brain permits.' }, { status: 403 });
  }

  try {
    const operation = normalized.operation as PermitOperation;
    const appId = String(normalized.app_id ?? '').trim();
    if (!appId && operation !== 'ROLLBACK') {
      return NextResponse.json({ error: 'app_id is required.' }, { status: 400 });
    }

    const { data: appData, error: appError } = await supabase
      .from('apps')
      .select('id')
      .eq('id', appId)
      .maybeSingle();

    if (!appId || appError || !appData) {
      return NextResponse.json({ error: 'app does not exist.' }, { status: 400 });
    }

    const appRole = String(normalized.app_role ?? '').trim();
    const resource = String(normalized.resource ?? '').trim();
    const action = String(normalized.action ?? '').trim();
    const scope = String(normalized.scope ?? '').trim();
    const field = String(normalized.field ?? '').trim();
    const changeReason = String(normalized.change_reason ?? '').trim() || `Operation: ${operation}`;

    let permitId = normalized.permit_id ?? null;
    let currentVersion: PermitVersionRow | null = null;
    let previousVersion: PermitVersionRow | null = null;

    if (operation !== 'CREATE') {
      if (!permitId) {
        return NextResponse.json({ error: 'permit_id is required for this operation.' }, { status: 400 });
      }

      const permit = await fetchPermitById(supabase, permitId);
      if (!permit) {
        return NextResponse.json({ error: 'permit does not exist.' }, { status: 404 });
      }

      currentVersion = await fetchCurrentVersion(supabase, permitId, permit.current_version_id);
      if (!currentVersion) {
        return NextResponse.json({ error: 'permit does not have a current version.' }, { status: 400 });
      }

      if (normalized.version_id && normalized.version_id !== currentVersion.id) {
        const { data: versionCandidate, error: versionError } = await supabase
          .from('brain_permit_versions')
          .select('id, permit_id')
          .eq('id', normalized.version_id)
          .eq('permit_id', permitId)
          .maybeSingle();

        if (versionError || !versionCandidate) {
          return NextResponse.json({ error: 'version does not belong to permit.' }, { status: 400 });
        }
      }

      const { data: versionRows } = await supabase
        .from('brain_permit_versions')
        .select('*')
        .eq('permit_id', permitId)
        .order('version', { ascending: false });

      const orderedVersions = (versionRows ?? []) as PermitVersionRow[];
      if (currentVersion) {
        const currentVersionNumber = currentVersion.version;
        previousVersion = orderedVersions
          .filter((version) => version.version < currentVersionNumber)
          .sort((left, right) => right.version - left.version)[0] ?? null;
      }
    }

    let nextVersionNumber = 1;
    let nextEnabled = normalized.enabled ?? true;
    let nextResource = resource;
    let nextField = field || null;
    let nextAction = action;
    let nextScope = scope;
    let nextAppRole = appRole;
    let nextOperation: PermitOperation = operation;
    let nextBeforeState: Record<string, unknown> | null = null;
    let nextAfterState: Record<string, unknown> | null = null;

    if (operation === 'CREATE') {
      const { data: newPermit, error: insertPermitError } = await supabase
        .from('brain_permits')
        .insert({
          app_id: appId,
          app_role: nextAppRole,
          current_version_id: null,
          created_by: user.id,
        })
        .select('*')
        .single();

      if (insertPermitError || !newPermit) {
        return NextResponse.json({ error: insertPermitError?.message ?? 'Failed to create permit.' }, { status: 500 });
      }

      permitId = newPermit.id;
      nextBeforeState = null;
      nextAfterState = {
        app_id: appId,
        app_role: nextAppRole,
        resource: nextResource,
        field: nextField,
        action: nextAction,
        scope: nextScope,
        enabled: nextEnabled,
      };

      const { data: versionRow, error: versionError } = await supabase
        .from('brain_permit_versions')
        .insert({
          permit_id: permitId,
          version: 1,
          resource: nextResource,
          field: nextField,
          action: nextAction,
          scope: nextScope,
          enabled: nextEnabled,
          operation: 'CREATE',
          changed_by: user.id,
          change_reason: changeReason,
          before_state: nextBeforeState,
          after_state: nextAfterState,
        })
        .select('*')
        .single();

      if (versionError || !versionRow) {
        return NextResponse.json({ error: versionError?.message ?? 'Failed to create version.' }, { status: 500 });
      }

      const { error: pointerError } = await supabase
        .from('brain_permits')
        .update({ current_version_id: versionRow.id, updated_at: new Date().toISOString() })
        .eq('id', permitId);

      if (pointerError) {
        return NextResponse.json({ error: pointerError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, permit: { id: permitId }, version: versionRow, message: 'Permit created successfully.' }, { status: 201 });
    }

    if (!currentVersion) {
      return NextResponse.json({ error: 'permit does not have a current version.' }, { status: 400 });
    }

    nextVersionNumber = currentVersion.version + 1;
    const currentStateMap = (currentVersion.after_state ?? currentVersion.before_state ?? {}) as Record<string, unknown>;
    nextBeforeState = currentVersion.after_state ?? currentVersion.before_state ?? {
      app_id: appId,
      app_role: nextAppRole || String(currentStateMap.app_role ?? ''),
      resource: currentVersion.resource,
      field: currentVersion.field,
      action: currentVersion.action,
      scope: currentVersion.scope,
      enabled: currentVersion.enabled,
    };

    if (operation === 'UPDATE') {
      nextResource = resource || currentVersion.resource;
      nextAction = action || currentVersion.action;
      nextScope = scope || currentVersion.scope;
      nextAppRole = appRole || String((currentVersion.after_state ?? currentVersion.before_state ?? {})?.app_role ?? '');
      nextField = field || currentVersion.field || null;
      nextEnabled = normalized.enabled ?? currentVersion.enabled;
      nextAfterState = {
        app_id: appId,
        app_role: nextAppRole,
        resource: nextResource,
        field: nextField,
        action: nextAction,
        scope: nextScope,
        enabled: nextEnabled,
      };
    }

    if (operation === 'ACTIVATE') {
      nextResource = resource || currentVersion.resource;
      nextAction = action || currentVersion.action;
      nextScope = scope || currentVersion.scope;
      nextAppRole = appRole || String((currentVersion.after_state ?? currentVersion.before_state ?? {})?.app_role ?? '');
      nextField = field || currentVersion.field || null;
      nextEnabled = true;
      nextAfterState = {
        app_id: appId,
        app_role: nextAppRole,
        resource: nextResource,
        field: nextField,
        action: nextAction,
        scope: nextScope,
        enabled: true,
      };
    }

    if (operation === 'DEACTIVATE') {
      nextResource = resource || currentVersion.resource;
      nextAction = action || currentVersion.action;
      nextScope = scope || currentVersion.scope;
      nextAppRole = appRole || String((currentVersion.after_state ?? currentVersion.before_state ?? {})?.app_role ?? '');
      nextField = field || currentVersion.field || null;
      nextEnabled = false;
      nextAfterState = {
        app_id: appId,
        app_role: nextAppRole,
        resource: nextResource,
        field: nextField,
        action: nextAction,
        scope: nextScope,
        enabled: false,
      };
    }

    if (operation === 'ROLLBACK') {
      if (!previousVersion) {
        return NextResponse.json({ error: 'No prior version exists to rollback to.' }, { status: 400 });
      }

      const targetState = (previousVersion.after_state ?? previousVersion.before_state ?? {}) as Record<string, unknown>;
      nextResource = String(targetState.resource ?? previousVersion.resource ?? resource ?? currentVersion.resource);
      nextAction = String(targetState.action ?? previousVersion.action ?? action ?? currentVersion.action);
      nextScope = String(targetState.scope ?? previousVersion.scope ?? scope ?? currentVersion.scope);
      nextAppRole = String(targetState.app_role ?? previousVersion.after_state?.app_role ?? previousVersion.before_state?.app_role ?? appRole ?? '');
      const fallbackField = previousVersion.field ?? (field || null);
      nextField = typeof targetState.field === 'string' ? targetState.field : fallbackField;
      nextEnabled = typeof targetState.enabled === 'boolean' ? targetState.enabled : previousVersion.enabled;
      nextAfterState = {
        app_id: appId,
        app_role: nextAppRole,
        resource: nextResource,
        field: nextField,
        action: nextAction,
        scope: nextScope,
        enabled: nextEnabled,
      };
    }

    const { data: versionRow, error: versionError } = await supabase
      .from('brain_permit_versions')
      .insert({
        permit_id: permitId,
        version: nextVersionNumber,
        resource: nextResource,
        field: nextField,
        action: nextAction,
        scope: nextScope,
        enabled: nextEnabled,
        operation: nextOperation,
        changed_by: user.id,
        change_reason: changeReason,
        before_state: nextBeforeState,
        after_state: nextAfterState,
      })
      .select('*')
      .single();

    if (versionError || !versionRow) {
      return NextResponse.json({ error: versionError?.message ?? 'Failed to create new permit version.' }, { status: 500 });
    }

    const { error: pointerError } = await supabase
      .from('brain_permits')
      .update({
        app_id: appId,
        app_role: nextAppRole,
        current_version_id: versionRow.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', permitId);

    if (pointerError) {
      return NextResponse.json({ error: pointerError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      permit: { id: permitId, app_id: appId, app_role: nextAppRole },
      version: versionRow,
      message: `Permit updated to version v${nextVersionNumber}.`,
    }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update Brain permit.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
