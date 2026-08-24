-- Provision profiles from auth.users without granting browser clients profile write access.
CREATE FUNCTION public.provision_profile_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_provision_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.provision_profile_from_auth_user();
