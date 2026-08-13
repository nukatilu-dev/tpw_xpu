/*
# Create admin_connections table for external service link management

## Purpose
Allows super admin to configure real external service connections (N8N, database, API endpoints, etc.)
so the platform can connect to live services instead of using dummy/placeholder data.

## New Tables
- `admin_connections`
  - `id` (uuid, primary key, auto-generated)
  - `name` (text, not null) — human-readable label for the connection
  - `type` (text, not null) — connection type: 'n8n', 'database', 'api', 'webhook', 'telegram_bot', 'whatsapp_bot', 'smtp'
  - `url` (text, nullable) — endpoint URL for the service
  - `api_key_ref` (text, nullable) — reference name for the secret stored in Supabase vault (never the actual key)
  - `config` (jsonb, nullable) — additional configuration (port, database name, etc.)
  - `is_active` (boolean, default true) — whether this connection is currently enabled
  - `created_by` (uuid, not null, default auth.uid()) — admin who created the connection
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Security
- RLS enabled on `admin_connections`
- Only authenticated users with `is_admin = true` in their profile can SELECT, INSERT, UPDATE, DELETE
- Uses a subquery check against `profiles` table for admin verification
- 4 separate policies (one per CRUD verb), scoped to admin users only

## Important Notes
1. The `api_key_ref` column stores only a REFERENCE NAME, never the actual secret value.
   Actual secrets should be stored in Supabase Vault or Edge Function environment variables.
2. The admin check queries `profiles.is_admin` for the current authenticated user.
3. `created_by` defaults to `auth.uid()` so the admin's identity is automatically recorded.
*/

CREATE TABLE IF NOT EXISTS admin_connections (
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

ALTER TABLE admin_connections ENABLE ROW LEVEL SECURITY;

-- Only admins can read connections
DROP POLICY IF EXISTS "admin_select_connections" ON admin_connections;
CREATE POLICY "admin_select_connections"
ON admin_connections FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Only admins can create connections
DROP POLICY IF EXISTS "admin_insert_connections" ON admin_connections;
CREATE POLICY "admin_insert_connections"
ON admin_connections FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Only admins can update connections
DROP POLICY IF EXISTS "admin_update_connections" ON admin_connections;
CREATE POLICY "admin_update_connections"
ON admin_connections FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Only admins can delete connections
DROP POLICY IF EXISTS "admin_delete_connections" ON admin_connections;
CREATE POLICY "admin_delete_connections"
ON admin_connections FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_admin_connections_type ON admin_connections(type);
CREATE INDEX IF NOT EXISTS idx_admin_connections_active ON admin_connections(is_active);