CREATE TABLE event_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('invitation', 'organizer_automation', 'sme_advertising', 'content_creator', 'manager_organization')),
  
  -- N8N Integration
  n8n_enabled boolean DEFAULT false,
  n8n_webhook_url text,
  n8n_workflow_id text,
  
  -- WA/Telegram Tagging
  tagging_enabled boolean DEFAULT false,
  whatsapp_numbers text[],
  telegram_chat_ids text[],
  tagging_message_template text,
  
  -- AI Agent
  ai_agent_enabled boolean DEFAULT false,
  ai_provider text CHECK (ai_provider IN ('openai', 'anthropic', 'custom')),
  ai_api_key_ref text,
  ai_model text,
  ai_system_prompt text,
  
  -- Scheduler
  scheduler_enabled boolean DEFAULT false,
  schedule_cron text,
  schedule_timezone text DEFAULT 'UTC',
  
  -- Publisher targets
  publisher_facebook boolean DEFAULT false,
  publisher_instagram boolean DEFAULT false,
  publisher_threads boolean DEFAULT false,
  publisher_tiktok boolean DEFAULT false,
  publisher_credentials jsonb DEFAULT '{}',
  
  -- Report settings
  report_enabled boolean DEFAULT false,
  report_frequency text CHECK (report_frequency IN ('daily', 'weekly', 'monthly')),
  report_email text,
  
  -- PostgreSQL connection
  db_connection_enabled boolean DEFAULT false,
  db_host text,
  db_port integer DEFAULT 5432,
  db_name text,
  db_user text,
  db_password_ref text,
  
  -- Form configuration
  config jsonb DEFAULT '{}',
  
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX event_automations_user_id_idx ON event_automations(user_id);
CREATE INDEX event_automations_category_idx ON event_automations(category);

ALTER TABLE event_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_automations" ON event_automations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_automations" ON event_automations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_automations" ON event_automations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_automations" ON event_automations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);