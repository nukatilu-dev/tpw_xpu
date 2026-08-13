
/*
# TPW Apps catalog table only (debug step)
*/
CREATE TABLE IF NOT EXISTS apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  status text NOT NULL DEFAULT 'development',
  icon text,
  route text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_apps" ON apps;
CREATE POLICY "public_select_apps" ON apps FOR SELECT
TO anon, authenticated USING (true);
