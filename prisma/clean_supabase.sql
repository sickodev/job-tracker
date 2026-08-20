-- Clean legacy foreign keys referencing auth.users if they exist
ALTER TABLE IF EXISTS public.jobs DROP CONSTRAINT IF EXISTS jobs_user_id_fkey;
ALTER TABLE IF EXISTS public.sheets DROP CONSTRAINT IF EXISTS sheets_user_id_fkey;
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Drop old legacy tables if present
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.sheets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public."Job" CASCADE;
DROP TABLE IF EXISTS public."Sheet" CASCADE;
DROP TABLE IF EXISTS public."User" CASCADE;
DROP TYPE IF EXISTS public."Role" CASCADE;
