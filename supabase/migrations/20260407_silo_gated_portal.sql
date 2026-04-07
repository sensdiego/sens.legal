-- Silo gated portal schema
-- Spec: docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md
-- Apply via Supabase dashboard SQL editor.

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'reviewer'
                    CHECK (role IN ('reviewer', 'admin')),
  welcomed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_self_read"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_self_update"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles_admin_read_all"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- access_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS access_requests (
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
  ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_created_at
  ON access_requests(created_at DESC);

ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "access_requests_self_read"
  ON access_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "access_requests_admin_all"
  ON access_requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- dd_views
-- ============================================================
CREATE TABLE IF NOT EXISTS dd_views (
  id              bigserial PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,
  page            text NOT NULL,
  ip              inet,
  user_agent      text,
  viewed_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dd_views_user_id
  ON dd_views(user_id);
CREATE INDEX IF NOT EXISTS idx_dd_views_viewed_at
  ON dd_views(viewed_at DESC);

ALTER TABLE dd_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dd_views_admin_only"
  ON dd_views FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- updated_at trigger for access_requests
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS access_requests_updated_at ON access_requests;
CREATE TRIGGER access_requests_updated_at
  BEFORE UPDATE ON access_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- profile auto-creation on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role) VALUES (NEW.id, 'reviewer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
