/*
# Rename event_automations to project_automations + create project_runs table

1. Renamed Tables
- `event_automations` -> `project_automations` (RENAME — no data loss, all columns/policies/indexes preserved)
- All existing RLS policies and indexes carry over automatically

2. New Tables
- `project_runs`
  - `id` (uuid, primary key)
  - `project_id` (uuid, FK -> project_automations, ON DELETE CASCADE)
  - `user_id` (uuid, FK -> auth.users, NOT NULL DEFAULT auth.uid())
  - `run_type` (text: 'schedule' | 'n8n' | 'manual' | 'ai' | 'publisher' | 'tagging')
  - `status` (text: 'running' | 'completed' | 'failed' | 'timeout')
  - `started_at` (timestamptz, DEFAULT now())
  - `completed_at` (timestamptz, nullable)
  - `duration_ms` (integer, nullable)
  - `tokens_used` (integer, DEFAULT 0)
  - `trigger` (text, nullable: 'cron' | 'webhook' | 'manual' | 'api')
  - `result_summary` (text, nullable)
  - `result_data` (jsonb, nullable)
  - `error_message` (text, nullable)
  - `metadata` (jsonb, nullable)
  - `created_at` (timestamptz, DEFAULT now())

3. Purpose
- Rename fixes the mismatch between code (queries `project_automations`) and DB (table was `event_automations`)
- `project_runs` tracks every execution of a project automation — enables a "Project Report" view showing run history, duration, success/failure, token usage
- Long-running events (e.g. music events) can show their progress timeline

4. Security
- RLS already enabled on event_automations (carried over to project_automations after rename)
- Enable RLS on `project_runs` with owner-scoped CRUD policies

5. Indexes
- Index on project_id for per-project run queries
- Index on user_id for cross-project run queries
- Index on started_at DESC for recent-run queries
*/

-- Step 1: Rename event_automations to project_automations
ALTER TABLE IF EXISTS event_automations RENAME TO project_automations;

-- Step 2: Create project_runs table
CREATE TABLE IF NOT EXISTS project_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES project_automations(id) ON DELETE CASCADE,
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

ALTER TABLE project_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_project_runs" ON project_runs;
CREATE POLICY "select_own_project_runs" ON project_runs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_project_runs" ON project_runs;
CREATE POLICY "insert_own_project_runs" ON project_runs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_project_runs" ON project_runs;
CREATE POLICY "update_own_project_runs" ON project_runs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_project_runs" ON project_runs;
CREATE POLICY "delete_own_project_runs" ON project_runs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_project_runs_project_id ON project_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_runs_user_id ON project_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_project_runs_started_at ON project_runs(started_at DESC);
