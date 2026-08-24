-- Brain Permit v1: immutable permit versions with a current-version pointer.

CREATE TABLE public.brain_permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE RESTRICT,
  app_role text NOT NULL,
  current_version_id uuid,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brain_permits_app_role_not_blank CHECK (length(trim(app_role)) > 0)
);

CREATE TABLE public.brain_permit_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id uuid NOT NULL REFERENCES public.brain_permits(id) ON DELETE RESTRICT,
  version integer NOT NULL,
  resource text NOT NULL,
  field text,
  action text NOT NULL,
  scope text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  operation text NOT NULL,
  changed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  change_reason text,
  before_state jsonb,
  after_state jsonb,
  CONSTRAINT brain_permit_versions_version_positive CHECK (version > 0),
  CONSTRAINT brain_permit_versions_operation_valid CHECK (
    operation IN ('CREATE', 'UPDATE', 'ACTIVATE', 'DEACTIVATE', 'ROLLBACK')
  ),
  CONSTRAINT brain_permit_versions_resource_not_blank CHECK (length(trim(resource)) > 0),
  CONSTRAINT brain_permit_versions_action_not_blank CHECK (length(trim(action)) > 0),
  CONSTRAINT brain_permit_versions_scope_not_blank CHECK (length(trim(scope)) > 0),
  CONSTRAINT brain_permit_versions_permit_version_unique UNIQUE (permit_id, version),
  CONSTRAINT brain_permit_versions_id_permit_unique UNIQUE (id, permit_id)
);

ALTER TABLE public.brain_permits
  ADD CONSTRAINT brain_permits_current_version_same_permit_fk
  FOREIGN KEY (current_version_id, id)
  REFERENCES public.brain_permit_versions(id, permit_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX brain_permits_app_id_idx
  ON public.brain_permits (app_id);

CREATE INDEX brain_permit_versions_permit_id_idx
  ON public.brain_permit_versions (permit_id);

CREATE INDEX brain_permit_versions_changed_by_idx
  ON public.brain_permit_versions (changed_by);

CREATE INDEX brain_permit_versions_lookup_idx
  ON public.brain_permit_versions (permit_id, version DESC);

CREATE FUNCTION public.prevent_brain_permit_version_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'brain_permit_versions is immutable';
END;
$$;

CREATE TRIGGER brain_permit_versions_immutable_trigger
  BEFORE UPDATE OR DELETE ON public.brain_permit_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_brain_permit_version_mutation();

CREATE FUNCTION public.require_brain_permit_current_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.current_version_id IS NULL THEN
    RAISE EXCEPTION 'brain_permits.current_version_id must not be null';
  END IF;

  RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER brain_permits_current_version_required_trigger
  AFTER INSERT OR UPDATE OF current_version_id ON public.brain_permits
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.require_brain_permit_current_version();

ALTER TABLE public.brain_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_permit_versions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.brain_permits FROM anon, authenticated;
REVOKE ALL ON public.brain_permit_versions FROM anon, authenticated;

GRANT SELECT ON public.brain_permits TO authenticated;
GRANT SELECT ON public.brain_permit_versions TO authenticated;
GRANT INSERT ON public.brain_permits TO authenticated;
GRANT UPDATE (current_version_id, updated_at) ON public.brain_permits TO authenticated;
GRANT INSERT ON public.brain_permit_versions TO authenticated;

CREATE POLICY brain_permits_admin_select
  ON public.brain_permits
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND upper(profiles.role) IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY brain_permit_versions_admin_select
  ON public.brain_permit_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND upper(profiles.role) IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY brain_permits_super_admin_insert
  ON public.brain_permits
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND upper(profiles.role) = 'SUPER_ADMIN'
    )
  );

CREATE POLICY brain_permits_super_admin_pointer_update
  ON public.brain_permits
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND upper(profiles.role) = 'SUPER_ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND upper(profiles.role) = 'SUPER_ADMIN'
    )
  );

CREATE POLICY brain_permit_versions_super_admin_insert
  ON public.brain_permit_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    changed_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND upper(profiles.role) = 'SUPER_ADMIN'
    )
  );