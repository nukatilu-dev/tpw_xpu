-- Protect portal authorization fields from authenticated client mutation.
-- Role and admin status are controlled outside normal profile editing.

REVOKE UPDATE ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
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

REVOKE INSERT ON TABLE public.profiles FROM anon, authenticated;
GRANT INSERT (
  id,
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

DROP POLICY IF EXISTS insert_own_profile ON public.profiles;
CREATE POLICY insert_own_profile ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role = 'user'
    AND is_admin = false
  );
