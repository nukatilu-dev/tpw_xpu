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
  Code2,
  Play,
  Upload,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { resolveTrustedRole } from '@/lib/portal-authorization';
import { BRAIN_DOMAINS, brainRegistry, verifyBrainConsoleDraft } from '@/lib/brain-contract';

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

function consoleContractFor(app: AppRow, existing?: Record<string, unknown> | null) {
  return existing ?? {
    target: { id: `app.${app.slug}`, name: app.name, app_id: app.id },
    domains: Object.fromEntries(BRAIN_DOMAINS.map((domain) => [domain, {}])),
    permits: [],
  };
}

function BrainConsoleSurface() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [permits, setPermits] = useState<PermitRecord[]>([]);
  const [targetId, setTargetId] = useState('');
  const [contractText, setContractText] = useState('');
  const [status, setStatus] = useState<{ tone: 'neutral' | 'success' | 'error'; title: string; details: string[] }>({ tone: 'neutral', title: 'Not run', details: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canMutate, setCanMutate] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) { setLoading(false); return; }
      const userId = session.session.user.id;
      const [{ data: profile }, { data: appRows }, { data: permitRows }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', userId).maybeSingle(),
        supabase.from('apps').select('id, name, slug').order('name'),
        supabase.from('brain_permits').select('*').order('updated_at', { ascending: false }),
      ]);
      const resolvedApps = (appRows ?? []) as AppRow[];
      const rawPermits = (permitRows ?? []) as PermitRecord[];
      const { data: versionRows } = rawPermits.length > 0
        ? await supabase.from('brain_permit_versions').select('*').in('permit_id', rawPermits.map((permit) => permit.id)).order('version', { ascending: false })
        : { data: [] };
      const resolvedPermits = rawPermits.map((permit) => ({
        ...permit,
        current_version: (versionRows as PermitVersion[] | null)?.find((version) => version.id === permit.current_version_id)
          ?? (versionRows as PermitVersion[] | null)?.find((version) => version.permit_id === permit.id)
          ?? null,
      }));
      setApps(resolvedApps);
      setPermits(resolvedPermits);
      setCanMutate(resolveTrustedRole((profile as { role?: string } | null)?.role) === 'SUPER_ADMIN');
      const firstApp = resolvedApps[0];
      if (firstApp) {
        setTargetId(firstApp.id);
        const permit = resolvedPermits.find((item) => item.app_id === firstApp.id);
        const stored = permit?.current_version?.after_state?.contract as Record<string, unknown> | undefined;
        setContractText(JSON.stringify(consoleContractFor(firstApp, stored), null, 2));
      }
      setLoading(false);
    }
    void load();
  }, []);

  const target = apps.find((app) => app.id === targetId) ?? null;
  const targetPermit = permits.find((permit) => permit.app_id === targetId) ?? null;
  const parsedContract = (() => { try { return JSON.parse(contractText) as Record<string, unknown>; } catch { return null; } })();
  const verification = parsedContract ? verifyBrainConsoleDraft(parsedContract) : { ok: false, errors: ['contract: invalid JSON'] };
  const storedVersion = targetPermit?.current_version;
  const currentContract = storedVersion?.after_state?.contract as Record<string, unknown> | undefined;
  const affectedDomains = parsedContract?.domains && typeof parsedContract.domains === 'object'
    ? Object.keys(parsedContract.domains)
    : [];

  function selectTarget(appId: string) {
    const app = apps.find((item) => item.id === appId);
    if (!app) return;
    const permit = permits.find((item) => item.app_id === appId);
    const stored = permit?.current_version?.after_state?.contract as Record<string, unknown> | undefined;
    setTargetId(appId);
    setContractText(JSON.stringify(consoleContractFor(app, stored), null, 2));
    setStatus({ tone: 'neutral', title: 'Not run', details: [] });
  }

  function runVerification() {
    if (!parsedContract) { setStatus({ tone: 'error', title: 'BLOCKED', details: ['contract: invalid JSON syntax'] }); return; }
    setStatus(verification.ok
      ? { tone: 'success', title: 'PASS', details: ['Syntax and contract structure verified.', `Domains present: ${affectedDomains.length}/9.`, 'No conflicts detected in the submitted structure.'] }
      : { tone: 'error', title: 'BLOCKED', details: verification.errors });
  }

  async function saveDraft() {
    setStatus({ tone: 'error', title: 'SAVE BLOCKED', details: [
      !canMutate ? 'authorization: only SUPER_ADMIN can save Brain drafts' : 'Persistence gap: current_version_id is the effective version pointer.',
      'The existing schema cannot store a draft without changing effective configuration, so no mutation was attempted.',
    ] });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252525] pb-4">
        <div className="flex items-center gap-3">
          <Code2 className="h-5 w-5 text-[#ff7a00]" />
          <span className="text-xs font-semibold tracking-[0.16em] text-[#666]">TARGET</span>
          <select value={targetId} onChange={(event) => selectTarget(event.target.value)} className="min-w-48 rounded-md border border-[#333] bg-[#080808] px-3 py-2 text-sm font-medium text-white focus:border-[#ff7a00] focus:outline-none">
            {apps.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
          </select>
          <span className="text-xs text-[#666]">{loading ? 'Loading...' : target ? `/${target.slug}` : 'No target available'}</span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={runVerification} className="inline-flex items-center gap-2 rounded-md border border-[#333] bg-[#111] px-3 py-2 text-xs font-semibold text-white hover:border-[#ff7a00]"><Play className="h-3.5 w-3.5" /> RUN</button>
          <button type="button" onClick={() => void saveDraft()} disabled={saving || !canMutate} className="inline-flex items-center gap-2 rounded-md bg-[#ff7a00] px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"><Save className="h-3.5 w-3.5" /> {saving ? 'SAVING' : 'SAVE'}</button>
          <button type="button" onClick={() => setStatus({ tone: 'error', title: 'PUBLISH BLOCKED', details: ['Persistence gap: current schema has no draft state, validator identity, decision, timestamp, or approval record.', 'No publish was attempted.'] })} className="inline-flex items-center gap-2 rounded-md border border-[#6b3d20] bg-[#241308] px-3 py-2 text-xs font-semibold text-[#ffb366]"><Upload className="h-3.5 w-3.5" /> PUBLISH</button>
        </div>
      </div>

      <div className="grid min-h-[680px] xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,.7fr)] overflow-hidden rounded-lg border border-[#252525] bg-[#080808]">
        <section className="flex min-h-[680px] flex-col border-b border-[#252525] xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-between border-b border-[#252525] px-4 py-3"><div><p className="text-xs font-semibold text-white">Brain contract</p><p className="text-[10px] text-[#666]">Editable JSON for the selected target</p></div><span className="font-mono text-[10px] text-[#555]">v{brainRegistry.version}</span></div>
          <textarea value={contractText} onChange={(event) => setContractText(event.target.value)} spellCheck={false} disabled={!canMutate} className="min-h-[620px] flex-1 resize-none bg-[#050505] p-5 font-mono text-xs leading-6 text-[#d7d7d7] outline-none focus:ring-1 focus:ring-inset focus:ring-[#ff7a00]/50 disabled:opacity-60" />
        </section>
        <aside className="bg-[#0b0b0b] p-5">
          <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold text-white">Object view</p><p className="text-[10px] text-[#666]">Interpreted structure, not an application render</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${status.tone === 'success' ? 'bg-[#12351f] text-[#86efac]' : status.tone === 'error' ? 'bg-[#351717] text-[#fca5a5]' : 'bg-[#1b1b1b] text-[#999]'}`}>{status.title}</span></div>
          <div className="space-y-4 text-xs">
            <div><p className="uppercase tracking-[.14em] text-[#555]">Selected target</p><p className="mt-1 font-medium text-white">{target?.name ?? 'None selected'}</p><p className="font-mono text-[10px] text-[#666]">{target?.id ?? '—'}</p></div>
            <div><p className="uppercase tracking-[.14em] text-[#555]">Version</p><p className="mt-1 text-[#ffb366]">{storedVersion ? `Current v${storedVersion.version}` : 'Unsaved draft'}</p></div>
            <div><p className="uppercase tracking-[.14em] text-[#555]">Affected domains</p><div className="mt-2 flex flex-wrap gap-1.5">{(affectedDomains.length ? affectedDomains : BRAIN_DOMAINS).map((domain) => <span key={domain} className="rounded border border-[#2d2d2d] px-2 py-1 font-mono text-[10px] text-[#999]">{domain}</span>)}</div></div>
            <div className="border-t border-[#252525] pt-4"><p className="uppercase tracking-[.14em] text-[#555]">Verification detail</p><ul className="mt-2 space-y-2 text-[#999]">{(status.details.length ? status.details : ['Run the draft to verify syntax, structure, relationships, access, and references.']).map((detail, index) => <li key={`${detail}-${index}`} className="leading-5">{detail}</li>)}</ul></div>
            <div className="border-t border-[#252525] pt-4"><p className="uppercase tracking-[.14em] text-[#555]">Change summary</p><p className="mt-2 leading-5 text-[#999]">{currentContract ? 'Pending contract is compared against the selected version.' : 'No persisted contract exists for this target yet.'}</p></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function BrainPermitEditor() {
  return <BrainConsoleSurface />;
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

      {message && (
        <div className={`rounded-lg border p-3 text-sm ${message?.type === 'success' ? 'border-[#22c55e]/20 bg-[#22c55e]/5 text-[#86efac]' : 'border-[#ef4444]/20 bg-[#ef4444]/5 text-[#fca5a5]'}`}>
          {message?.text}
        </div>
      )}

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
                    disabled={!canMutate || saving || loading || (currentVersion?.version ?? 0) <= 1}
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
                    <p className="font-medium text-[#ff7a00]">v{currentVersion?.version}</p>
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
