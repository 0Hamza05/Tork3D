-- Run this in the Supabase SQL Editor BEFORE launch.
-- Backs the early-access / launch-coupon flow used by server.js
-- (/api/early-access, /api/validate-coupon, markCouponUsed).

CREATE TABLE IF NOT EXISTS tork3d_early_access (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  name          text        NOT NULL,
  email         text        NOT NULL,
  phone         text        NOT NULL,
  coupon_code   text        NOT NULL UNIQUE,
  used          boolean     NOT NULL DEFAULT false,
  used_order_id text                            -- links to tork3d_orders.id when redeemed
);

-- Fast lookups by the columns the server filters on.
CREATE UNIQUE INDEX IF NOT EXISTS idx_early_access_coupon ON tork3d_early_access (coupon_code);
CREATE INDEX        IF NOT EXISTS idx_early_access_email  ON tork3d_early_access (lower(email));

-- The server uses the SERVICE key (bypasses RLS). Enable RLS and add NO public
-- policies so the table is unreadable from the public anon key. Safe default.
ALTER TABLE tork3d_early_access ENABLE ROW LEVEL SECURITY;
