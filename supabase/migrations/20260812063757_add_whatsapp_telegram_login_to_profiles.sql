/*
# Add WhatsApp and Telegram login columns to profiles

## Summary
Adds columns to the `profiles` table to support login/contact via WhatsApp number
and Telegram username, plus a `whatsapp_verified` flag for future OTP login.

## Changes
### 1. New Columns on `profiles`
- `whatsapp_number` (text) — WhatsApp phone number for contact/login
- `telegram_chat_id` (text) — Telegram chat ID for bot-based login
- `whatsapp_verified` (boolean, default false) — whether the WhatsApp number was verified via OTP
- `telegram_verified` (boolean, default false) — whether the Telegram account was verified
- `twitter_username` (text) — Twitter/X handle (was missing from original migration)
- `linkedin_url` (text) — LinkedIn profile URL (was missing from original migration)
- `github_username` (text) — GitHub username (was missing from original migration)
- `username` (text) — unique display username (was missing from original migration)
- `phone` (text) — general phone number (was missing from original migration)
- `role` (text, default 'user') — user role (was missing from original migration)
- `is_admin` (boolean, default false) — admin flag (was missing from original migration)

### 2. Security
- No policy changes needed — existing SELECT policy already scopes to `auth.uid() = id`
- Added UPDATE policy for own profile (was missing from original migration)

### 3. Important Notes
- All columns are nullable/optional — existing rows are unaffected
- The `is_admin` column is controlled server-side, not user-editable via the profile form
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'whatsapp_number') THEN
    ALTER TABLE profiles ADD COLUMN whatsapp_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'telegram_chat_id') THEN
    ALTER TABLE profiles ADD COLUMN telegram_chat_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'whatsapp_verified') THEN
    ALTER TABLE profiles ADD COLUMN whatsapp_verified boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'telegram_verified') THEN
    ALTER TABLE profiles ADD COLUMN telegram_verified boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'twitter_username') THEN
    ALTER TABLE profiles ADD COLUMN twitter_username text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linkedin_url') THEN
    ALTER TABLE profiles ADD COLUMN linkedin_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'github_username') THEN
    ALTER TABLE profiles ADD COLUMN github_username text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE profiles ADD COLUMN username text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Add UPDATE policy for own profile (was missing)
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Add INSERT policy for own profile (was missing)
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
