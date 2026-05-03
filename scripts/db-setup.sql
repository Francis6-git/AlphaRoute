-- AlphaRoute Database Setup
-- Run this in the Supabase SQL Editor for project: hpwacbhxsvahvlbmbseq
-- https://app.supabase.com/project/hpwacbhxsvahvlbmbseq/sql/new

-- ── Trades Table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trades (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet          TEXT        NOT NULL,
  input_token     TEXT        NOT NULL,
  output_token    TEXT        NOT NULL,
  input_amount    NUMERIC     NOT NULL DEFAULT 0,
  output_amount   NUMERIC     NOT NULL DEFAULT 0,
  input_usd       NUMERIC     NOT NULL DEFAULT 0,
  output_usd      NUMERIC     NOT NULL DEFAULT 0,
  route_provider  TEXT        NOT NULL DEFAULT 'dflow',
  execution_score INTEGER     NOT NULL DEFAULT 0,
  slippage_bps    INTEGER     NOT NULL DEFAULT 0,
  mev_protected   BOOLEAN     NOT NULL DEFAULT true,
  signature       TEXT,
  status          TEXT        NOT NULL DEFAULT 'confirmed',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trades_wallet     ON trades(wallet);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_signature  ON trades(signature);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trades_all" ON trades;
CREATE POLICY "trades_all" ON trades FOR ALL USING (true) WITH CHECK (true);

-- ── Price Alerts Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_alerts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet            TEXT        NOT NULL,
  token_mint        TEXT        NOT NULL,
  token_symbol      TEXT        NOT NULL,
  target_price      NUMERIC     NOT NULL,
  direction         TEXT        NOT NULL CHECK (direction IN ('above', 'below')),
  action            TEXT        NOT NULL CHECK (action IN ('notify', 'trade')),
  trade_input_mint  TEXT,
  trade_output_mint TEXT,
  trade_amount      NUMERIC,
  kamino_withdraw   BOOLEAN     NOT NULL DEFAULT false,
  kamino_vault_id   TEXT,
  status            TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'cancelled')),
  triggered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_wallet ON price_alerts(wallet);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON price_alerts(status);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alerts_all" ON price_alerts;
CREATE POLICY "alerts_all" ON price_alerts FOR ALL USING (true) WITH CHECK (true);
