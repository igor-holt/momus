CREATE TABLE IF NOT EXISTS listings (
  listing_id        TEXT PRIMARY KEY,
  skill_name        TEXT NOT NULL,
  owner_orcid       TEXT NOT NULL,
  settlement_rail   TEXT NOT NULL CHECK (settlement_rail IN ('stripe','x402')),
  price_units       INTEGER NOT NULL,
  crystalline       REAL NOT NULL,
  maru_declared     INTEGER NOT NULL CHECK (maru_declared IN (0,1)),
  trace_declared    INTEGER NOT NULL CHECK (trace_declared IN (0,1)),
  status            TEXT NOT NULL CHECK (status IN ('listed','suspended','rejected')),
  created_at        INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS seats (
  seat_id           TEXT PRIMARY KEY,
  workspace_id      TEXT NOT NULL,
  rail              TEXT NOT NULL CHECK (rail IN ('stripe','x402')),
  evidence_ref      TEXT NOT NULL,
  granted_at        INTEGER NOT NULL,
  revoked_at        INTEGER
);

CREATE TABLE IF NOT EXISTS findings (
  finding_id        TEXT PRIMARY KEY,
  target            TEXT NOT NULL,
  severity          TEXT NOT NULL CHECK (severity IN ('info','low','medium','high','critical')),
  evidence_hash     TEXT NOT NULL,
  dora_gate         TEXT NOT NULL CHECK (dora_gate IN ('pass','fail')),
  created_at        INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS capsule_events (
  evt_id            TEXT PRIMARY KEY,
  plane             TEXT NOT NULL,
  record_type       TEXT NOT NULL,
  payload_hash      TEXT NOT NULL,
  ts_ms             INTEGER NOT NULL
);
