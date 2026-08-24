-- Allow an authenticated user to update only their own editable profile row.
-- Authorization fields remain excluded from the column grant.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT UPDATE (
  full_name,
  username,
  avatar_url,
  company,
  job_title,
  phone,
  website,
  bio,
  telegram_username,
  telegram_chat_id,
  telegram_verified,
  whatsapp_number,
  whatsapp_verified,
  twitter_username,
  linkedin_url,
  github_username,
  instagram_username,
  updated_at
) ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS update_own_profile ON public.profiles;
CREATE POLICY update_own_profile ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);