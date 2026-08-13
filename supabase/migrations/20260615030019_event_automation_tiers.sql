-- Add tier, credit tokens, and admin fields to event_automations
ALTER TABLE event_automations 
  ADD COLUMN tier text NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'standard', 'expert', 'advance', 'custom')),
  ADD COLUMN credit_tokens integer DEFAULT 100,
  ADD COLUMN tokens_used integer DEFAULT 0,
  ADD COLUMN review_status text CHECK (review_status IN ('pending', 'approved', 'rejected', 'not_required')),
  ADD COLUMN review_notes text,
  ADD COLUMN reviewed_by uuid REFERENCES auth.users(id),
  ADD COLUMN reviewed_at timestamptz;

-- Add index for admin queries
CREATE INDEX event_automations_tier_idx ON event_automations(tier);
CREATE INDEX event_automations_review_status_idx ON event_automations(review_status);

-- Create admin role in profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Grant admin access to all event_automations for admin users
CREATE POLICY "admin_full_access_automations" ON event_automations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
    OR user_id = auth.uid()
  );