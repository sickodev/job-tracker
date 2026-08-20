-- Enable Row Level Security (RLS) on public tables
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Sheet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Job" ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running script
DROP POLICY IF EXISTS "Users can view own profile" ON public."User";
DROP POLICY IF EXISTS "Users can insert own profile" ON public."User";
DROP POLICY IF EXISTS "Users can update own profile" ON public."User";

DROP POLICY IF EXISTS "Users can view own sheets" ON public."Sheet";
DROP POLICY IF EXISTS "Users can create own sheets" ON public."Sheet";
DROP POLICY IF EXISTS "Users can update own sheets" ON public."Sheet";
DROP POLICY IF EXISTS "Users can delete own sheets" ON public."Sheet";

DROP POLICY IF EXISTS "Users can view own jobs" ON public."Job";
DROP POLICY IF EXISTS "Users can create own jobs" ON public."Job";
DROP POLICY IF EXISTS "Users can update own jobs" ON public."Job";
DROP POLICY IF EXISTS "Users can delete own jobs" ON public."Job";

-- ----------------------------------------------------------------------------
-- 1. "User" Table Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
  ON public."User"
  FOR SELECT
  USING (auth.uid()::text = id OR role = 'DEMO');

CREATE POLICY "Users can insert own profile"
  ON public."User"
  FOR INSERT
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON public."User"
  FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- ----------------------------------------------------------------------------
-- 2. "Sheet" Table Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own sheets"
  ON public."Sheet"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own sheets"
  ON public."Sheet"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own sheets"
  ON public."Sheet"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own sheets"
  ON public."Sheet"
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- ----------------------------------------------------------------------------
-- 3. "Job" Table Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own jobs"
  ON public."Job"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own jobs"
  ON public."Job"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own jobs"
  ON public."Job"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own jobs"
  ON public."Job"
  FOR DELETE
  USING (auth.uid()::text = "userId");
