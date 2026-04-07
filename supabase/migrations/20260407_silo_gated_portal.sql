-- Silo gated portal schema
-- Spec: docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md
-- Apply via Supabase dashboard SQL editor.
--
-- Idempotency: every CREATE POLICY is preceded by DROP POLICY IF EXISTS so this
-- file can be re-executed cleanly if a partial run aborts midway. Functions use
-- CREATE OR REPLACE.

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'reviewer'
                    CHECK (role IN ('reviewer', 'admin')),
  welcomed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
CREATE POLICY "profiles_self_read"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- NOTE: profiles_self_update is intentionally OMITTED. The previous version had
-- USING (id = auth.uid()) with no WITH CHECK, allowing any authenticated reviewer
-- to call supabase.from('profiles').update({ role: 'admin' }).eq('id', auth.uid())
-- via the REST API and self-promote. The only legitimate self-update is
-- welcomed_at, which now goes through portal/src/pages/api/auth/welcome.ts using
-- the service role (bypasses RLS). No client-side update path is needed.

-- profiles_admin_read_all is replaced by routing all admin reads through the
-- service-role client (supabaseAdmin) in admin pages and middleware. The
-- previous recursive subquery (EXISTS SELECT FROM profiles ...) caused
-- "infinite recursion detected in policy for relation profiles" — Postgres
-- re-evaluates the same policy on the inner query and errors out.

-- ============================================================
-- access_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.access_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,
  name            text,
  avatar_url      text,
  provider        text NOT NULL CHECK (provider IN ('google', 'github')),
  github_handle   text,
  org             text,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  approved_at     timestamptz,
  approved_by     uuid REFERENCES auth.users(id),
  notes           text
);

CREATE INDEX IF NOT EXISTS idx_access_requests_status
  ON public.access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_created_at
  ON public.access_requests(created_at DESC);
-- Cover the approved_by FK so DELETEs on auth.users do not seq-scan
-- access_requests. Partial index keeps it small (most rows are NULL).
CREATE INDEX IF NOT EXISTS idx_access_requests_approved_by
  ON public.access_requests(approved_by) WHERE approved_by IS NOT NULL;

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "access_requests_self_read" ON public.access_requests;
CREATE POLICY "access_requests_self_read"
  ON public.access_requests FOR SELECT
  USING (user_id = auth.uid());

-- access_requests_admin_all is omitted. Admin reads/writes go through
-- supabaseAdmin (service role) in admin pages and the access/[id].ts endpoint,
-- which bypasses RLS entirely. The previous policy used a recursive EXISTS
-- subquery against profiles that triggered the same recursion bug as
-- profiles_admin_read_all.

-- ============================================================
-- dd_views
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dd_views (
  id              bigserial PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,
  page            text NOT NULL,
  ip              inet,
  user_agent      text,
  viewed_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dd_views_user_id
  ON public.dd_views(user_id);
CREATE INDEX IF NOT EXISTS idx_dd_views_viewed_at
  ON public.dd_views(viewed_at DESC);
-- Composite index supports the dedupe lookup in track-view (user + page +
-- viewed_at filter for the last 60 seconds).
CREATE INDEX IF NOT EXISTS idx_dd_views_user_page_viewed_at
  ON public.dd_views(user_id, page, viewed_at DESC);

ALTER TABLE public.dd_views ENABLE ROW LEVEL SECURITY;

-- No client-readable policy on dd_views: every write goes through
-- supabaseAdmin in track-view.ts, every read goes through supabaseAdmin in
-- /admin/views.astro. RLS is enabled so anon-key clients see zero rows by
-- default — strictest possible posture for an audit table.

-- ============================================================
-- updated_at trigger for access_requests
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS access_requests_updated_at ON public.access_requests;
CREATE TRIGGER access_requests_updated_at
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- profile auto-creation on signup
-- ============================================================
-- SECURITY DEFINER + SET search_path = public, pg_temp prevents the classic
-- CVE-2018-1058 search_path hijack: without an explicit search_path, a malicious
-- role can shadow the unqualified `profiles` reference with an attacker-owned
-- table that runs under the function owner's privileges. The schema-qualified
-- public.profiles is belt-and-suspenders.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, role) VALUES (NEW.id, 'reviewer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROLLBACK (manual, in dependency order)
-- ============================================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TRIGGER IF EXISTS access_requests_updated_at ON public.access_requests;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP FUNCTION IF EXISTS public.update_updated_at_column();
-- DROP TABLE IF EXISTS public.dd_views;
-- DROP TABLE IF EXISTS public.access_requests;
-- DROP TABLE IF EXISTS public.profiles;
