/*
# Add Instagram username to profiles table

1. Modified Tables
- `profiles` — added `instagram_username` (text, nullable) column
- Stores the user's Instagram handle for profile display and social linking

2. Security
- No policy changes needed — column inherits existing RLS policies on profiles
- Users can only read/update their own profile row (already enforced)
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS instagram_username text;
