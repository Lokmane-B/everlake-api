-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, company_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'company_name', ''));
  RETURN NEW;
END;
$$;