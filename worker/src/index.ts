/**
 * MOMUS Deployer — Epoch E2
 * Critic / marketplace / meter planes on one Worker isolate.
 * Payer secrets must remain Stripe/x402 API keys only — never critic signing keys.
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
  API_KEYS: KVNamespace
  METER_CURSOR: KVNamespace
  USAGE_DO: DurableObjectNamespace
  STRIPE_API_KEY: string
  STRIPE_METER_EVENT_NAME: string
  STRIPE_WEBHOOK_SECRET: string
  X402_RECEIVER: string
}

type Vars = { workspaceId: string; tier: string }

const app = new Hono<{ Bindings: Bindings; Variables: Vars }>()
app.use('*', cors())

app.get('/v1/health', (c) =>
  c.json({
    ok: true,
    epoch: '2026-09-13-E2',
    agent: 'momus',
    planes: ['critic', 'marketplace', 'meter'],
    ts: Date.now(),
  }),
)

app.use('/v1/infer', bearerAuth)
app.use('/v1/usage', bearerAuth)
app.use('/v1/listings', bearerAuth)
app.use('/v1/seats', bearerAuth)

app.post('/v1/critique', async (c) => {
  const body = await c.req.json<{ target: string; artifact_hash: string; notes?: string }>()
  if (!body?.target || !body?.artifact_hash) return c.json({ error: 'target_and_hash_required' }, 400)
  const finding_id = crypto.randomUUID()
  const dora_gate = body.artifact_hash.length >= 64 ? 'pass' : 'fail'
  const severity = dora_gate === 'fail' ? 'medium' : 'info'
  await c.env.DB.prepare(
    `INSERT INTO findings (finding_id, target, severity, evidence_hash, dora_gate, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(finding_id, body.target, severity, body.artifact_hash, dora_gate, Date.now())
    .run()
  await capsule(c.env.DB, 'critic', 'finding', finding_id)
  return c.json({ finding_id, dora_gate, severity, epoch: '2026-09-13-E2' })
})

app.post('/v1/listings', async (c) => {
  const body = await c.req.json<{
    skill_name: string
    owner_orcid?: string
    settlement_rail: 'stripe' | 'x402'
    price_units: number
    crystalline: number
    maru_declared: boolean
    trace_declared: boolean
  }>()
  if (!body?.skill_name) return c.json({ error: 'skill_name_required' }, 400)
  const rejected = !body.maru_declared || !body.trace_declared || (body.crystalline ?? 0) < 0.85
  const listing_id = crypto.randomUUID()
  const status = rejected ? 'rejected' : 'listed'
  await c.env.DB.prepare(
    `INSERT INTO listings (listing_id, skill_name, owner_orcid, settlement_rail, price_units, crystalline, maru_declared, trace_declared, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      listing_id,
      body.skill_name,
      body.owner_orcid ?? '0009-0008-8389-1297',
      body.settlement_rail ?? 'stripe',
      body.price_units ?? 0,
      body.crystalline ?? 0,
      body.maru_declared ? 1 : 0,
      body.trace_declared ? 1 : 0,
      status,
      Date.now(),
    )
    .run()
  await capsule(c.env.DB, 'marketplace', 'listing', listing_id)
  return c.json({ listing_id, status, stream: 'R09' }, rejected ? 422 : 201)
})

app.post('/v1/seats', async (c) => {
  const body = await c.req.json<{ workspace_id: string; rail: 'stripe' | 'x402'; evidence_ref: string }>()
  if (!body?.workspace_id || !body?.evidence_ref) return c.json({ error: 'seat_evidence_required' }, 400)
  const seat_id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO seats (seat_id, workspace_id, rail, evidence_ref, granted_at) VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(seat_id, body.workspace_id, body.rail ?? 'x402', body.evidence_ref, Date.now())
    .run()
  await capsule(c.env.DB, 'marketplace', 'seat', seat_id)
  return c.json({ seat_id, stream: 'R05', status: 'granted' }, 201)
})

app.post('/v1/infer', async (c) => {
  const workspaceId = c.get('workspaceId')
  const over = await overQuota(c.env.DB, workspaceId)
  if (over) return c.json({ error: 'quota_exceeded' }, 429)
  const body = await c.req.json<{ model?: string; prompt: string; max_tokens?: number }>()
  if (!body?.prompt) return c.json({ error: 'prompt required' }, 400)
  const model = body.model ?? 'frugal-cascade'
  const units = Math.max(1, Math.ceil((body.prompt.length + (body.max_tokens ?? 512)) / 4))
  await c.env.DB.prepare(
    `INSERT INTO usage_events (event_id, workspace_id, endpoint, model, tokens_in, tokens_out, units, ts_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(crypto.randomUUID(), workspaceId, '/v1/infer', model, units, 0, units, Date.now())
    .run()
  await capsule(c.env.DB, 'meter', 'infer', workspaceId)
  return c.json({ model, output: { epoch: '2026-09-13-E2', note: 'cascade stub — bind provider keys before production' }, usage: { units } })
})

app.get('/v1/usage', async (c) => {
  const workspaceId = c.get('workspaceId')
  const since = Number(c.req.query('since_ms') ?? Date.now() - 86400000)
  const { results } = await c.env.DB.prepare(
    `SELECT ts_ms, endpoint, model, units, flushed_at FROM usage_events
     WHERE workspace_id = ? AND ts_ms >= ? ORDER BY ts_ms DESC LIMIT 500`,
  )
    .bind(workspaceId, since)
    .all()
  return c.json({ workspace_id: workspaceId, events: results })
})

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(flushAll(env))
  },
}

export class UsageAggregator {
  constructor(private readonly state: DurableObjectState) {}
  async fetch(): Promise<Response> {
    return new Response('momus-usage-do-e2')
  }
}

async function bearerAuth(c: any, next: () => Promise<void>) {
  const h = c.req.header('Authorization') ?? ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  if (!token) return c.json({ error: 'missing_bearer' }, 401)
  const keyHash = await sha256Hex(token)
  const meta = (await c.env.API_KEYS.get(keyHash, 'json')) as { workspace_id: string; tier: string; revoked?: boolean } | null
  if (!meta || meta.revoked) return c.json({ error: 'invalid_key' }, 401)
  c.set('workspaceId', meta.workspace_id)
  c.set('tier', meta.tier)
  await next()
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function overQuota(db: D1Database, workspaceId: string): Promise<boolean> {
  const monthStart = Date.now() - 30 * 86400000
  const row = await db
    .prepare(`SELECT COALESCE(SUM(units),0) AS used FROM usage_events WHERE workspace_id = ? AND ts_ms >= ?`)
    .bind(workspaceId, monthStart)
    .first<{ used: number }>()
  return (row?.used ?? 0) > 500_000 * 1.2
}

async function capsule(db: D1Database, plane: string, record_type: string, ref: string) {
  await db
    .prepare(`INSERT INTO capsule_events (evt_id, plane, record_type, payload_hash, ts_ms) VALUES (?, ?, ?, ?, ?)`)
    .bind(crypto.randomUUID(), plane, record_type, ref, Date.now())
    .run()
}

async function flushAll(env: Bindings) {
  const now = Date.now()
  const { results } = (await env.DB.prepare(
    `SELECT workspace_id, SUM(units) AS delta, MAX(ts_ms) AS max_ts
     FROM usage_events WHERE flushed_at IS NULL GROUP BY workspace_id`,
  ).all()) as { results: Array<{ workspace_id: string; delta: number; max_ts: number }> }

  for (const row of results ?? []) {
    if (!row.delta) continue
    const bucket = Math.floor(now / (30 * 60_000))
    const idempKey = `momus:${row.workspace_id}:${bucket}`
    if (await env.METER_CURSOR.get(idempKey)) continue
    try {
      const body = new URLSearchParams()
      body.set('event_name', env.STRIPE_METER_EVENT_NAME)
      body.set('identifier', idempKey)
      body.set('timestamp', String(Math.floor(now / 1000)))
      body.set('payload[stripe_customer_id]', row.workspace_id)
      body.set('payload[value]', String(row.delta))
      const res = await fetch('https://api.stripe.com/v1/billing/meter_events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.STRIPE_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })
      if (!res.ok) throw new Error(`stripe_${res.status}`)
      await env.DB.prepare(
        `UPDATE usage_events SET flushed_at = ? WHERE workspace_id = ? AND flushed_at IS NULL AND ts_ms <= ?`,
      )
        .bind(now, row.workspace_id, row.max_ts)
        .run()
      await env.METER_CURSOR.put(idempKey, '1', { expirationTtl: 7 * 24 * 3600 })
    } catch (err) {
      console.error('flush_failed', row.workspace_id, err)
    }
  }
}
