-- admin_notifications — run this once in the Supabase SQL editor
-- Stores admin panel events: new businesses, promoter claims, subscription issues, stuck clients

CREATE TABLE IF NOT EXISTS admin_notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text        NOT NULL,
  message     text        NOT NULL,
  business_id uuid        REFERENCES businesses(id) ON DELETE CASCADE,
  read        boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_notif_unread
  ON admin_notifications(read, created_at DESC);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super admin notifications" ON admin_notifications;
CREATE POLICY "super admin notifications" ON admin_notifications FOR ALL
  USING  ((auth.jwt() ->> 'email') = 'fitpaperwork25@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'fitpaperwork25@gmail.com');

GRANT ALL ON admin_notifications TO authenticated;
