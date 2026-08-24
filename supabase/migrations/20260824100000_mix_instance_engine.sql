-- MIX Instance Engine v1: UUID-3 temporary flow records.
-- This migration is intentionally not applied automatically.

CREATE TABLE public.mix_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  source_object_id uuid NOT NULL,
  source_object_type text NOT NULL CHECK (source_object_type IN ('APP', 'PROJECT')),
  target_object_id uuid NOT NULL,
  target_object_type text NOT NULL CHECK (target_object_type IN ('APP', 'PROJECT')),
  database_context jsonb,
  scope_context jsonb,
  permit_id uuid REFERENCES public.brain_permits(id) ON DELETE RESTRICT,
  contract_reference text,
  status text NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'RUNNING', 'COMPLETED', 'TERMINATED', 'FAILED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  terminated_at timestamptz,
  result_reason text,
  tc_usage_reference text,
  token_usage_reference text,
  CONSTRAINT mix_instances_distinct_objects CHECK (source_object_id <> target_object_id)
);

CREATE TABLE public.mix_instance_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES public.mix_instances(id) ON DELETE RESTRICT,
  object_id uuid NOT NULL,
  object_type text NOT NULL CHECK (object_type IN ('APP', 'PROJECT')),
  role text NOT NULL CHECK (role IN ('SOURCE', 'TARGET', 'ADDITIONAL')),
  scope_context jsonb,
  database_context jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mix_id, object_id)
);

CREATE TABLE public.mix_instance_lifecycle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid NOT NULL REFERENCES public.mix_instances(id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (event_type IN ('CREATE', 'START', 'COMPLETE', 'TERMINATE', 'FAIL', 'REJECT')),
  from_status text,
  to_status text NOT NULL CHECK (to_status IN ('CREATED', 'RUNNING', 'COMPLETED', 'TERMINATED', 'FAILED')),
  reason text,
  actor_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  executed_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  details jsonb
);

CREATE INDEX mix_instances_user_created_idx ON public.mix_instances (user_id, created_at DESC);
CREATE INDEX mix_instances_source_idx ON public.mix_instances (source_object_id);
CREATE INDEX mix_instances_target_idx ON public.mix_instances (target_object_id);
CREATE INDEX mix_instance_participants_mix_idx ON public.mix_instance_participants (mix_id);
CREATE INDEX mix_instance_lifecycle_mix_created_idx ON public.mix_instance_lifecycle (mix_id, created_at ASC);

CREATE FUNCTION public.prevent_mix_instance_lifecycle_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'mix_instance_lifecycle is immutable';
END;
$$;

CREATE TRIGGER mix_instance_lifecycle_immutable_trigger
  BEFORE UPDATE OR DELETE ON public.mix_instance_lifecycle
  FOR EACH ROW EXECUTE FUNCTION public.prevent_mix_instance_lifecycle_mutation();

ALTER TABLE public.mix_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mix_instance_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mix_instance_lifecycle ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.mix_instances, public.mix_instance_participants, public.mix_instance_lifecycle FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.mix_instances TO authenticated;
GRANT SELECT, INSERT ON public.mix_instance_participants TO authenticated;
GRANT SELECT, INSERT ON public.mix_instance_lifecycle TO authenticated;

CREATE POLICY mix_instances_owner_or_admin_select ON public.mix_instances
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND upper(role) IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY mix_instances_owner_insert ON public.mix_instances
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY mix_instances_owner_or_admin_update ON public.mix_instances
  FOR UPDATE TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND upper(role) IN ('ADMIN', 'SUPER_ADMIN')
    )
  ) WITH CHECK (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND upper(role) IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY mix_participants_owner_or_admin_select ON public.mix_instance_participants
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.mix_instances m WHERE m.id = mix_id AND (
      m.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND upper(role) IN ('ADMIN', 'SUPER_ADMIN'))
    ))
  );

CREATE POLICY mix_participants_owner_insert ON public.mix_instance_participants
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.mix_instances m WHERE m.id = mix_id AND m.user_id = auth.uid())
  );

CREATE POLICY mix_lifecycle_owner_or_admin_select ON public.mix_instance_lifecycle
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.mix_instances m WHERE m.id = mix_id AND (
      m.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND upper(role) IN ('ADMIN', 'SUPER_ADMIN'))
    ))
  );

CREATE POLICY mix_lifecycle_owner_or_admin_insert ON public.mix_instance_lifecycle
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.mix_instances m WHERE m.id = mix_id AND (
      m.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND upper(role) IN ('ADMIN', 'SUPER_ADMIN')
    )))
  );
