'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Circle,
  Eye,
  FileText,
  Plus,
  Power,
  RefreshCcw,
  Save,
  Shield,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { resolveTrustedRole } from '@/lib/portal-authorization';

type AppRow = { id: string; name: string; slug: string };

type PermitVersion = {
  id: string;
  permit_id: string;
  version: number;
  resource: string;
  field: string | null;
  action: string;
  scope: string;
  enabled: boolean;
  operation: 'CREATE' | 'UPDATE' | 'ACTIVATE' | 'DEACTIVATE' | 'ROLLBACK';
  changed_by: string;
  created_at: string;
  change_reason: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
};

type PermitRecord = {
  id: string;
  app_id: string;
  app_role: string;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
  current_version?: PermitVersion | null;
  app?: AppRow | null;
};

type PermitFormState = {
  app_id: string;
  app_role: string;
  resource: string;
  field: string;
  action: string;
  scope: string;
  enabled: boolean;
  change_reason: string;
};

const emptyForm = (): PermitFormState => ({
  app_id: '',
  app_role: '',
  resource: '',
  field: '',
  action: '',
  scope: '',
  enabled: true,
  change_reason: '',
});

function normalizeRole(value: string): string {
  return value.trim();
}

function versionSummary(version: PermitVersion | null | undefined) {
  if (!version) return null;
  return {
    app_role: (version.after_state as Record<string, unknown> | null)?.app_role ?? (version.before_state as Record<string, unknown> | null)?.app_role ?? '',
    resource: version.resource,
    field: version.field ?? '',
    action: version.action,
    scope: version.scope,
    enabled: version.enabled,
  };
}

export function BrainPermitEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permits, setPermits] = useState<PermitRecord[]>([]);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [selectedPermitId, setSelectedPermitId] = useState<string | null>(null);
  const [form, setForm] = useState<PermitFormState>(emptyForm());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [canMutate, setCanMutate] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setMessage(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user ?? null;
      if (!user) {
        if (mounted) {
          setPermits([]);
          setLoading(false);
          setCanMutate(false);
        }
        return;
      }

      const [{ data: profileData }, { data: appsData }, { data: permitData }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
        supabase.from('apps').select('id, name, slug').order('name', { ascending: true }),
        supabase.from('brain_permits').select('*').order('updated_at', { ascending: false }),
      ]);

      const role = resolveTrustedRole((profileData as { role?: string } | null)?.role);
      const hasAccess = role === 'SUPER_ADMIN';
      setCanMutate(hasAccess);

      if (!mounted) return;

      const resolvedApps = (appsData ?? []) as AppRow[];
      setApps(resolvedApps);

      if (permitData) {
        const permitIds = (permitData as { id: string }[]).map((permit) => permit.id);
        let versionData: PermitVersion[] = [];

        if (permitIds.length > 0) {
          const { data: versions } = await supabase
            .from('brain_permit_versions')
            .select('*')
            .in('permit_id', permitIds)
            .order('version', { ascending: true });
          versionData = (versions ?? []) as PermitVersion[];
        }

        const appMap = new Map(resolvedApps.map((app) => [app.id, app]));
        const permitsWithVersions = (permitData as PermitRecord[]).map((permit) => {
          const versionsForPermit = versionData.filter((version) => version.permit_id === permit.id);
          const currentVersion = versionsForPermit.find((version) => version.id === permit.current_version_id)
            ?? versionsForPermit.sort((a, b) => a.version - b.version).at(-1)
            ?? null;
          return {
            ...permit,
            app: appMap.get(permit.app_id) ?? null,
            current_version: currentVersion,
          };
        });

        setPermits(permitsWithVersions);
        if (!selectedPermitId && permitsWithVersions.length > 0) {
          setSelectedPermitId(permitsWithVersions[0].id);
          setForm(buildFormFromPermit(permitsWithVersions[0]));
        }
      } else {
        setPermits([]);
      }

      setLoading(false);
    }

    void loadData();
    return () => { mounted = false; };
  }, [selectedPermitId]);

  const selectedPermit = useMemo(() => permits.find((permit) => permit.id === selectedPermitId) ?? null, [permits, selectedPermitId]);
  const currentVersion = selectedPermit?.current_version ?? null;
  const currentState = (versionSummary(currentVersion) as {
    app_role?: string;
    resource?: string;
    field?: string;
    action?: string;
    scope?: string;
    enabled?: boolean;
  } | null) ?? {
    app_role: '',
    resource: '',
    field: '',
    action: '',
    scope: '',
    enabled: true,
  };
  const nextState: {
    app_role: string;
    resource: string;
    field: string;
    action: string;
    scope: string;
    enabled: boolean;
  } = {
    app_role: normalizeRole(form.app_role),
    resource: form.resource.trim(),
    field: form.field.trim(),
    action: form.action.trim(),
    scope: form.scope.trim(),
    enabled: form.enabled,
  };

  function buildFormFromPermit(permit: PermitRecord): PermitFormState {
    const version = permit.current_version;
    return {
      app_id: permit.app_id,
      app_role: permit.app_role,
      resource: version?.resource ?? '',
      field: version?.field ?? '',
      action: version?.action ?? '',
      scope: version?.scope ?? '',
      enabled: version?.enabled ?? true,
      change_reason: version?.change_reason ?? '',
    };
  }

  async function reloadPermits() {
    setLoading(true);
    const { data: permitData } = await supabase.from('brain_permits').select('*').order('updated_at', { ascending: false });
    const permitIds = (permitData ?? []).map((permit) => permit.id);
    let versionData: PermitVersion[] = [];
    if (permitIds.length > 0) {
      const { data: versions } = await supabase
        .from('brain_permit_versions')
        .select('*')
        .in('permit_id', permitIds)
        .order('version', { ascending: true });
      versionData = (versions ?? []) as PermitVersion[];
    }

    const appMap = new Map(apps.map((app) => [app.id, app]));
    const merged = (permitData ?? []).map((permit) => {
      const versionsForPermit = versionData.filter((version) => version.permit_id === permit.id);
      const currentVersionRecord = versionsForPermit.find((version) => version.id === permit.current_version_id)
        ?? versionsForPermit.sort((a, b) => a.version - b.version).at(-1)
        ?? null;

      return {
        ...permit,
        app: appMap.get(permit.app_id) ?? null,
        current_version: currentVersionRecord,
      } as PermitRecord;
    });

    setPermits(merged);
    if (!selectedPermitId && merged.length > 0) {
      setSelectedPermitId(merged[0].id);
      setForm(buildFormFromPermit(merged[0]));
    }
    setLoading(false);
  }

  async function runMutation(operation: 'CREATE' | 'UPDATE' | 'ACTIVATE' | 'DEACTIVATE' | 'ROLLBACK') {
    if (!canMutate) {
      setMessage({ type: 'error', text: 'Only SUPER_ADMIN can modify Brain permits.' });
      return;
    }

    const payload: Record<string, unknown> = {
      operation,
      permit_id: selectedPermitId ?? null,
      app_id: form.app_id,
      app_role: form.app_role,
      resource: form.resource,
      field: form.field,
      action: form.action,
      scope: form.scope,
      enabled: form.enabled,
      change_reason: form.change_reason,
    };

    if (operation === 'ROLLBACK' && selectedPermit && selectedPermit.current_version) {
      const previousVersion = selectedPermit.current_version
        ? (permits.find((permit) => permit.id === selectedPermit.id)?.current_version ?? selectedPermit.current_version)
        : null;
      payload.version_id = previousVersion?.id ?? selectedPermit.current_version.id;
    }

    if (!form.app_id || !form.app_role || !form.resource || !form.action || !form.scope) {
      setMessage({ type: 'error', text: 'App, app role, resource, action, and scope are required.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const response = await fetch('/api/brain-permits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok) {
      setMessage({ type: 'error', text: result?.error ?? 'Permission update failed.' });
      return;
    }

    setMessage({ type: 'success', text: result?.message ?? 'Permit saved successfully.' });
    setSelectedPermitId(result.permit?.id ?? selectedPermitId);
    await reloadPermits();
  }

  async function createNewPermit() {
    setSelectedPermitId(null);
    setForm(emptyForm());
    setMessage(null);
  }

  function handleSelectPermit(permit: PermitRecord) {
    setSelectedPermitId(permit.id);
    setForm(buildFormFromPermit(permit));
    setMessage(null);
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 pb-4 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-[#ff7a00]" />
          <h2 className="text-lg font-bold text-white">Brain Permit Editor</h2>
        </div>
        <p className="text-sm text-[#555]">Universal permit control for app, app role, resource, action, and scope.</p>
      </div>

      {!canMutate && !loading ? (
        <div className="rounded-lg border border-[#ef4444]/20 bg-[#ef4444]/5 p-4 text-sm text-[#fca5a5]">
          You do not have permission to create or change Brain permits.
        </div>
      ) : null}

      {message ? (
        <div className={`rounded-lg border p-3 text-sm ${message.type === 'success' ? 'border-[#22c55e]/20 bg-[#22c55e]/5 text-[#86efac]' : 'border-[#ef4444]/20 bg-[#ef4444]/5 text-[#fca5a5]'}`}>
          {message.text}
        </div>
      ) : null}

      <div className="grid xl:grid-cols-[1.4fr_1.6fr_1.3fr] gap-6">
        <section className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">1. Existing Permits</h3>
            <button
              type="button"
              onClick={createNewPermit}
              className="inline-flex items-center gap-2 rounded-md border border-[#ff7a00]/40 bg-[#ff7a00]/10 px-2.5 py-1.5 text-xs font-medium text-[#ffb366] hover:bg-[#ff7a00]/20"
            >
              <Plus className="w-3.5 h-3.5" />
              New permit
            </button>
          </div>

          <div className="space-y-2 max-h-[540px] overflow-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : permits.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#1f1f1f] bg-[#050505] p-4 text-sm text-[#666]">
                No permits yet.
              </div>
            ) : (
              permits.map((permit) => {
                const version = permit.current_version;
                return (
                  <button
                    key={permit.id}
                    type="button"
                    onClick={() => handleSelectPermit(permit)}
                    className={`w-full rounded-md border p-3 text-left transition ${selectedPermitId === permit.id ? 'border-[#ff7a00]/50 bg-[#ff7a00]/5' : 'border-[#1f1f1f] bg-[#050505] hover:border-[#2a2a2a]'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-[#555]">{permit.app?.name ?? 'Unknown app'}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{permit.app_role}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${version?.enabled ? 'bg-[#22c55e]/10 text-[#86efac]' : 'bg-[#ef4444]/10 text-[#fca5a5]'}`}>
                        {version?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-[#888] flex flex-wrap gap-x-3 gap-y-1">
                      <span>{version?.resource ?? '-'}</span>
                      <span>{version?.field ?? '—'}</span>
                      <span>{version?.action ?? '-'}</span>
                      <span>{version?.scope ?? '-'}</span>
                    </div>
                    <div className="mt-2 text-[10px] text-[#555]">Current version v{version?.version ?? 0}</div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">2. Edit Permit</h3>
            {selectedPermit ? (
              <span className="rounded-full border border-[#1f1f1f] bg-[#111] px-2 py-0.5 text-[10px] font-medium text-[#888]">
                v{currentVersion?.version ?? 0}
              </span>
            ) : null}
          </div>

          <div className="space-y-4">
            <label className="block text-xs uppercase tracking-[0.12em] text-[#555]">
              App
              <select
                value={form.app_id}
                onChange={(event) => setForm((previous) => ({ ...previous, app_id: event.target.value }))}
                className="mt-1 w-full rounded-md border border-[#1f1f1f] bg-[#050505] px-3 py-2 text-sm text-white focus:border-[#ff7a00] focus:outline-none"
                disabled={!canMutate}
              >
                <option value="">Select an app</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>{app.name}</option>
                ))}
              </select>
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-xs uppercase tracking-[0.12em] text-[#555]">
                App Role
                <input
                  value={form.app_role}
                  onChange={(event) => setForm((previous) => ({ ...previous, app_role: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-[#1f1f1f] bg-[#050505] px-3 py-2 text-sm text-white focus:border-[#ff7a00] focus:outline-none"
                  placeholder="SALES"
                  disabled={!canMutate}
                />
              </label>

              <label className="block text-xs uppercase tracking-[0.12em] text-[#555]">
                Enabled
                <div className="mt-1 flex items-center gap-3 rounded-md border border-[#1f1f1f] bg-[#050505] px-3 py-2">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(event) => setForm((previous) => ({ ...previous, enabled: event.target.checked }))}
                    className="h-4 w-4 accent-[#ff7a00]"
                    disabled={!canMutate}
                  />
                  <span className="text-sm text-white">{form.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-xs uppercase tracking-[0.12em] text-[#555]">
                Resource
                <input
                  value={form.resource}
                  onChange={(event) => setForm((previous) => ({ ...previous, resource: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-[#1f1f1f] bg-[#050505] px-3 py-2 text-sm text-white focus:border-[#ff7a00] focus:outline-none"
                  placeholder="CONTACT"
                  disabled={!canMutate}
                />
              </label>

              <label className="block text-xs uppercase tracking-[0.12em] text-[#555]">
                Field (optional)
                <input
                  value={form.field}
                  onChange={(event) => setForm((previous) => ({ ...previous, field: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-[#1f1f1f] bg-[#050505] px-3 py-2 text-sm text-white focus:border-[#ff7a00] focus:outline-none"
                  placeholder="email"
                  disabled={!canMutate}
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-xs uppercase tracking-[0.12em] text-[#555]">
                Action
                <input
                  value={form.action}
                  onChange={(event) => setForm((previous) => ({ ...previous, action: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-[#1f1f1f] bg-[#050505] px-3 py-2 text-sm text-white focus:border-[#ff7a00] focus:outline-none"
                  placeholder="VIEW"
                  disabled={!canMutate}
                />
              </label>

              <label className="block text-xs uppercase tracking-[0.12em] text-[#555]">
                Scope
                <input
                  value={form.scope}
                  onChange={(event) => setForm((previous) => ({ ...previous, scope: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-[#1f1f1f] bg-[#050505] px-3 py-2 text-sm text-white focus:border-[#ff7a00] focus:outline-none"
                  placeholder="OWN"
                  disabled={!canMutate}
                />
              </label>
            </div>

            <label className="block text-xs uppercase tracking-[0.12em] text-[#555]">
              Change reason
              <textarea
                value={form.change_reason}
                onChange={(event) => setForm((previous) => ({ ...previous, change_reason: event.target.value }))}
                className="mt-1 w-full rounded-md border border-[#1f1f1f] bg-[#050505] px-3 py-2 text-sm text-white focus:border-[#ff7a00] focus:outline-none min-h-[88px]"
                placeholder="Describe why this change is needed"
                disabled={!canMutate}
              />
            </label>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => void runMutation(selectedPermit ? 'UPDATE' : 'CREATE')}
                disabled={!canMutate || saving || loading}
                className="inline-flex items-center gap-2 rounded-md bg-[#ff7a00] px-3 py-2 text-sm font-semibold text-black hover:bg-[#e86e00] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : selectedPermit ? 'Save version' : 'Create permit'}
              </button>

              {selectedPermit ? (
                <>
                  <button
                    type="button"
                    onClick={() => void runMutation('ACTIVATE')}
                    disabled={!canMutate || saving || loading}
                    className="inline-flex items-center gap-2 rounded-md border border-[#22c55e]/40 bg-[#22c55e]/10 px-3 py-2 text-sm font-medium text-[#86efac] hover:bg-[#22c55e]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Power className="w-4 h-4" />
                    Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => void runMutation('DEACTIVATE')}
                    disabled={!canMutate || saving || loading}
                    className="inline-flex items-center gap-2 rounded-md border border-[#ef4444]/40 bg-[#ef4444]/10 px-3 py-2 text-sm font-medium text-[#fca5a5] hover:bg-[#ef4444]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Deactivate
                  </button>
                  <button
                    type="button"
                    onClick={() => void runMutation('ROLLBACK')}
                    disabled={!canMutate || saving || loading || !currentVersion || currentVersion.version <= 1}
                    className="inline-flex items-center gap-2 rounded-md border border-[#60a5fa]/40 bg-[#60a5fa]/10 px-3 py-2 text-sm font-medium text-[#bfdbfe] hover:bg-[#60a5fa]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Rollback
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">3. Version Preview</h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-md border border-[#1f1f1f] bg-[#050505] p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#555]">Current version</p>
              <div className="mt-2 text-sm text-white">
                {currentVersion ? (
                  <>
                    <p className="font-medium text-[#ff7a00]">v{currentVersion.version}</p>
                    <p className="mt-2">{currentState.app_role || '—'} / {currentState.resource || '—'} / {currentState.action || '—'}</p>
                    <p className="text-[#888]">field: {currentState.field || 'not set'}</p>
                    <p className="text-[#888]">scope: {currentState.scope || 'not set'}</p>
                    <p className="text-[#888]">enabled = {currentState.enabled ? 'true' : 'false'}</p>
                  </>
                ) : (
                  <p className="text-[#888]">No current version yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-md border border-[#ff7a00]/20 bg-[#ff7a00]/5 p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#ffb366]">New version</p>
              <div className="mt-2 text-sm text-white">
                <p className="font-medium text-[#ffb366]">v{(currentVersion?.version ?? 0) + 1}</p>
                <p className="mt-2">{nextState.app_role || '—'} / {nextState.resource || '—'} / {nextState.action || '—'}</p>
                <p className="text-[#f4d7b5]">field: {nextState.field || 'not set'}</p>
                <p className="text-[#f4d7b5]">scope: {nextState.scope || 'not set'}</p>
                <p className="text-[#f4d7b5]">enabled = {nextState.enabled ? 'true' : 'false'}</p>
              </div>
            </div>

            <div className="rounded-md border border-[#1f1f1f] bg-[#050505] p-3 text-xs text-[#888]">
              <p className="font-medium text-white">What changed</p>
              <ul className="mt-2 space-y-1">
                {currentState.app_role !== nextState.app_role ? <li>• App role: {currentState.app_role || '—'} → {nextState.app_role || '—'}</li> : null}
                {currentState.resource !== nextState.resource ? <li>• Resource: {currentState.resource || '—'} → {nextState.resource || '—'}</li> : null}
                {currentState.field !== nextState.field ? <li>• Field: {currentState.field || '—'} → {nextState.field || '—'}</li> : null}
                {currentState.action !== nextState.action ? <li>• Action: {currentState.action || '—'} → {nextState.action || '—'}</li> : null}
                {currentState.scope !== nextState.scope ? <li>• Scope: {currentState.scope || '—'} → {nextState.scope || '—'}</li> : null}
                {currentState.enabled !== nextState.enabled ? <li>• Enabled: {String(currentState.enabled)} → {String(nextState.enabled)}</li> : null}
                {currentState.app_role === nextState.app_role && currentState.resource === nextState.resource && currentState.field === nextState.field && currentState.action === nextState.action && currentState.scope === nextState.scope && currentState.enabled === nextState.enabled ? <li>• No material change detected.</li> : null}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
