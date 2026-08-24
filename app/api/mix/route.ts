import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { resolveTrustedRole, type TrustedRole } from '@/lib/portal-authorization';
import { createActivityLog } from '@/lib/activity-log';
import { isMixTerminationReason, isMixTransitionAllowed, validateMixCreate, type MixObjectType, type MixStatus } from '@/lib/mix-instance-engine';

type JsonRecord = Record<string, unknown>;

function client() {
  const cookieStore = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => { try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
    },
  });
}

function bodyObject(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

async function actor() {
  const supabase = client();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null, role: 'USER' as TrustedRole };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return { supabase, user, role: resolveTrustedRole((profile as { role?: string } | null)?.role) };
}

async function objectExists(supabase: ReturnType<typeof client>, id: string, type: MixObjectType, userId: string, role: TrustedRole) {
  if (type === 'APP') {
    const { data } = await supabase.from('apps').select('id').eq('id', id).maybeSingle();
    return Boolean(data);
  }
  let query = supabase.from('project_automations').select('id').eq('id', id);
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') query = query.eq('user_id', userId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
}

async function writeNotification(supabase: ReturnType<typeof client>, userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') {
  await supabase.from('notifications').insert({ user_id: userId, title, message, type, is_read: false, link: '/projects' });
}

export async function GET(request: Request) {
  const { supabase, user, role } = await actor();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const url = new URL(request.url);
  const mixId = url.searchParams.get('id');
  let query = supabase.from('mix_instances').select('*, mix_instance_participants(*), mix_instance_lifecycle(*)').order('created_at', { ascending: false });
  if (mixId) query = query.eq('id', mixId);
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') query = query.eq('user_id', user.id);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ mixes: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user, role } = await actor();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  let payload: JsonRecord | null;
  try { payload = bodyObject(await request.json()); } catch { payload = null; }
  if (!payload) return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });

  const operation = typeof payload.operation === 'string' ? payload.operation.toUpperCase() : '';
  if (operation === 'CREATE') {
    const validation = validateMixCreate({ ...payload, user_id: user.id });
    if (!validation.ok) return NextResponse.json({ error: validation.errors.join('; ') }, { status: 400 });
    const input = validation.value;
    const participants = [
      { object_id: input.source_object_id, object_type: input.source_object_type, role: 'SOURCE' as const },
      { object_id: input.target_object_id, object_type: input.target_object_type, role: 'TARGET' as const },
      ...(input.participants ?? []).filter((item) => item.object_id !== input.source_object_id && item.object_id !== input.target_object_id),
    ];
    for (const participant of participants) {
      if (!await objectExists(supabase, participant.object_id, participant.object_type, user.id, role)) {
        return NextResponse.json({ error: `Object does not exist or is not available: ${participant.object_id}` }, { status: 400 });
      }
    }
    if (input.permit_id) {
      const { data: permit } = await supabase.from('brain_permits').select('id, app_id').eq('id', input.permit_id).maybeSingle();
      if (!permit) return NextResponse.json({ error: 'permit_id does not reference an existing Brain permit.' }, { status: 400 });
    }
    const { data: mix, error } = await supabase.from('mix_instances').insert({
      user_id: user.id, source_object_id: input.source_object_id, source_object_type: input.source_object_type,
      target_object_id: input.target_object_id, target_object_type: input.target_object_type,
      database_context: input.database_context, scope_context: input.scope_context, permit_id: input.permit_id,
      contract_reference: input.contract_reference, status: 'CREATED', tc_usage_reference: input.tc_usage_reference,
      token_usage_reference: input.token_usage_reference,
    }).select().single();
    if (error || !mix) return NextResponse.json({ error: error?.message ?? 'MIX creation failed.' }, { status: 500 });
    const { error: participantError } = await supabase.from('mix_instance_participants').insert(participants.map((item) => ({ ...item, mix_id: mix.id })));
    if (participantError) return NextResponse.json({ error: participantError.message }, { status: 500 });
    const { error: ledgerError } = await supabase.from('mix_instance_lifecycle').insert({ mix_id: mix.id, event_type: 'CREATE', to_status: 'CREATED', actor_id: user.id, executed_by: user.id, details: { participant_count: participants.length } });
    if (ledgerError) return NextResponse.json({ error: ledgerError.message }, { status: 500 });
    return NextResponse.json({ mix }, { status: 201 });
  }

  const mixId = typeof payload.mix_id === 'string' ? payload.mix_id : '';
  if (!mixId) return NextResponse.json({ error: 'mix_id is required.' }, { status: 400 });
  const { data: mix, error: mixError } = await supabase.from('mix_instances').select('*').eq('id', mixId).maybeSingle();
  if (mixError || !mix) return NextResponse.json({ error: 'MIX instance not found.' }, { status: 404 });
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  if (mix.user_id !== user.id && !isAdmin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  const fromStatus = mix.status as MixStatus;
  let toStatus: MixStatus;
  let eventType: 'START' | 'COMPLETE' | 'TERMINATE' | 'FAIL' | 'REJECT';
  let reason: string | null = null;
  if (operation === 'START') { toStatus = 'RUNNING'; eventType = 'START'; }
  else if (operation === 'COMPLETE') { toStatus = 'COMPLETED'; eventType = 'COMPLETE'; }
  else if (operation === 'TERMINATE') {
    if (!isMixTerminationReason(payload.reason)) return NextResponse.json({ error: 'reason must be one of the canonical termination reasons.' }, { status: 400 });
    reason = payload.reason;
    if (reason === 'USER_REQUEST' && mix.user_id !== user.id) return NextResponse.json({ error: 'Only the MIX owner may submit USER_REQUEST.' }, { status: 403 });
    if (reason === 'LEGAL_PROCESS' && !isAdmin) return NextResponse.json({ error: 'LEGAL_PROCESS requires an administrative actor.' }, { status: 403 });
    if (reason === 'ADMIN_DECISION' && !isAdmin) return NextResponse.json({ error: 'ADMIN_DECISION requires an administrative actor.' }, { status: 403 });
    toStatus = 'TERMINATED'; eventType = 'TERMINATE';
  } else if (operation === 'FAIL') { toStatus = 'FAILED'; eventType = 'FAIL'; reason = typeof payload.reason === 'string' ? payload.reason : null; }
  else return NextResponse.json({ error: 'Supported operations: CREATE, START, COMPLETE, TERMINATE, FAIL.' }, { status: 400 });

  if (!isMixTransitionAllowed(fromStatus, toStatus)) return NextResponse.json({ error: `Invalid MIX transition: ${fromStatus} -> ${toStatus}.` }, { status: 409 });
  const now = new Date().toISOString();
  const updates: JsonRecord = { status: toStatus, result_reason: reason };
  if (toStatus === 'RUNNING') updates.started_at = now;
  if (toStatus === 'COMPLETED') updates.completed_at = now;
  if (toStatus === 'TERMINATED') updates.terminated_at = now;
  const { data: updated, error: updateError } = await supabase.from('mix_instances').update(updates).eq('id', mixId).select().single();
  if (updateError || !updated) return NextResponse.json({ error: updateError?.message ?? 'MIX update failed.' }, { status: 500 });
  const { error: ledgerError } = await supabase.from('mix_instance_lifecycle').insert({ mix_id: mixId, event_type: eventType, from_status: fromStatus, to_status: toStatus, reason, actor_id: user.id, executed_by: user.id });
  if (ledgerError) return NextResponse.json({ error: ledgerError.message }, { status: 500 });
  if (toStatus === 'TERMINATED') {
    await writeNotification(supabase, mix.user_id, 'MIX terminated', `MIX ${mixId} was terminated: ${reason}. Effective ${now}.`, 'warning');
  }
  await createActivityLog({ userId: mix.user_id, action: `MIX_${eventType}`, description: `MIX ${mixId} changed from ${fromStatus} to ${toStatus}.`, metadata: { mix_id: mixId, reason, source_object_id: mix.source_object_id, target_object_id: mix.target_object_id } });
  return NextResponse.json({ mix: updated });
}
