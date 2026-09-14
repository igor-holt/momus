CREATE TABLE IF NOT EXISTS api_keys (
  key_hash      TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL,
  tier          TEXT NOT NULL CHECK (tier IN ('free','starter','pro','enterprise','coalition')),
  rate_limit    INTEGER NOT NULL DEFAULT 60,
  created_at    INTEGER NOT NULL,
  revoked_at    INTEGER
);

CREATE TABLE IF NOT EXISTS usage_events (
  event_id      TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL,
  endpoint      TEXT NOT NULL,
  model         TEXT,
  tokens_in     INTEGER NOT NULL DEFAULT 0,
  tokens_out    INTEGER NOT NULL DEFAULT 0,
  units         INTEGER NOT NULL,
  ts_ms         INTEGER NOT NULL,
  flushed_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_usage_unflushed ON usage_events (flushed_at, ts_ms);
CREATE INDEX IF NOT EXISTS idx_usage_workspace ON usage_events (workspace_id, ts_ms);

CREATE TABLE IF NOT EXISTS flush_cursors (
  workspace_id  TEXT PRIMARY KEY,
  last_flush_ms INTEGER NOT NULL,
  last_delta    INTEGER NOT NULL,
  last_meter_id TEXT
);
