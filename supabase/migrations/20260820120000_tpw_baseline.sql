-- TPW canonical baseline for project keaulcobungynijduahx.
-- This creates the final schema directly; it does not replay legacy migrations.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  username text,
  avatar_url text,
  company text,
  job_title text,
  phone text,
  website text,
  bio text,
  telegram_username text,
  telegram_chat_id text,
  telegram_verified boolean DEFAULT false,
  whatsapp_number text,
  whatsapp_verified boolean DEFAULT false,
  twitter_username text,
  linkedin_url text,
  github_username text,
  instagram_username text,
  role text DEFAULT 'user',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  category text,
  status text NOT NULL DEFAULT 'development',
  url text,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text,
  status text NOT NULL,
  start_date timestamptz,
  end_date timestamptz,
  location text,
  is_online boolean NOT NULL,
  meeting_url text,
  max_attendees integer,
  cover_image text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  tags text[],
  image_url text,
  project_url text,
  github_url text,
  category text,
  featured boolean NOT NULL,
  sort_order integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  message text,
  category text,
  status text NOT NULL,
  priority text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL,
  is_read boolean NOT NULL,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.project_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('event', 'content', 'business', 'automation', 'custom')),
  n8n_enabled boolean DEFAULT false,
  n8n_webhook_url text,
  n8n_workflow_id text,
  tagging_enabled boolean DEFAULT false,
  whatsapp_numbers text[],
  telegram_chat_ids text[],
  tagging_message_template text,
  ai_agent_enabled boolean DEFAULT false,
  ai_provider text CHECK (ai_provider IN ('openai', 'anthropic', 'custom')),
  ai_api_key_ref text,
  ai_model text,
  ai_system_prompt text,
  scheduler_enabled boolean DEFAULT false,
  schedule_cron text,
  schedule_timezone text DEFAULT 'UTC',
  publisher_facebook boolean DEFAULT false,
  publisher_instagram boolean DEFAULT false,
  publisher_threads boolean DEFAULT false,
  publisher_tiktok boolean DEFAULT false,
  publisher_credentials jsonb DEFAULT '{}'::jsonb,
  report_enabled boolean DEFAULT false,
  report_frequency text CHECK (report_frequency IN ('daily', 'weekly', 'monthly')),
  report_email text,
  db_connection_enabled boolean DEFAULT false,
  db_host text,
  db_port integer DEFAULT 5432,
  db_name text,
  db_user text,
  db_password_ref text,
  config jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  tier text NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'standard', 'expert', 'advance', 'custom')),
  credit_tokens integer DEFAULT 100,
  tokens_used integer DEFAULT 0,
  review_status text CHECK (review_status IN ('pending', 'approved', 'rejected', 'not_required')),
  review_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz
);

CREATE TABLE public.project_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.project_automations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  run_type text NOT NULL DEFAULT 'manual' CHECK (run_type IN ('schedule', 'n8n', 'manual', 'ai', 'publisher', 'tagging')),
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'timeout')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration_ms integer,
  tokens_used integer NOT NULL DEFAULT 0,
  trigger text CHECK (trigger IN ('cron', 'webhook', 'manual', 'api') OR trigger IS NULL),
  result_summary text,
  result_data jsonb,
  error_message text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('n8n', 'database', 'api', 'webhook', 'telegram_bot', 'whatsapp_bot', 'smtp')),
  url text,
  api_key_ref text,
  config jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX events_created_by_created_at_idx ON public.events (created_by, created_at DESC);
CREATE INDEX portfolio_projects_sort_order_idx ON public.portfolio_projects (sort_order);
CREATE INDEX support_tickets_user_id_created_at_idx ON public.support_tickets (user_id, created_at DESC);
CREATE INDEX notifications_user_id_created_at_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX activity_log_user_id_created_at_idx ON public.activity_log (user_id, created_at DESC);
CREATE INDEX event_automations_user_id_idx ON public.project_automations (user_id);
CREATE INDEX event_automations_category_idx ON public.project_automations (category);
CREATE INDEX event_automations_tier_idx ON public.project_automations (tier);
CREATE INDEX event_automations_review_status_idx ON public.project_automations (review_status);
CREATE INDEX idx_project_runs_project_id ON public.project_runs (project_id);
CREATE INDEX idx_project_runs_user_id ON public.project_runs (user_id);
CREATE INDEX idx_project_runs_started_at ON public.project_runs (started_at DESC);
CREATE INDEX idx_admin_connections_type ON public.admin_connections (type);
CREATE INDEX idx_admin_connections_active ON public.admin_connections (is_active);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_profile ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY insert_own_profile ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY update_own_profile ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY delete_own_profile ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE POLICY public_select_apps ON public.apps FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY select_own_events ON public.events FOR SELECT TO authenticated USING (auth.uid() = created_by);
CREATE POLICY insert_own_events ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY update_own_events ON public.events FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY delete_own_events ON public.events FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY public_select_portfolio ON public.portfolio_projects FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY select_own_tickets ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_tickets ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_tickets ON public.support_tickets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_tickets ON public.support_tickets FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY select_own_notifications ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_notifications ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_notifications ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_notifications ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY select_own_activity ON public.activity_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_activity ON public.activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY select_own_automations ON public.project_automations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_automations ON public.project_automations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_automations ON public.project_automations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_automations ON public.project_automations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY admin_full_access_automations ON public.project_automations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true) OR user_id = auth.uid());

CREATE POLICY select_own_project_runs ON public.project_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_project_runs ON public.project_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_project_runs ON public.project_runs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_project_runs ON public.project_runs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY admin_select_connections ON public.admin_connections FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY admin_insert_connections ON public.admin_connections FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY admin_update_connections ON public.admin_connections FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY admin_delete_connections ON public.admin_connections FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'activity_log'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
  END IF;
END $$;
