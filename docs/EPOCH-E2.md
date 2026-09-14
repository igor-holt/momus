# MOMUS Epoch E2 — Critique-to-Cash

**Epoch id:** `2026-09-13-E2`  
**Owner:** Igor Holt, Kovach Enterprises — ORCID `0009-0008-8389-1297`  
**Prior epoch:** v0.1 deployer (2026-05-20) + fleet critic card (standby since 2026-04-20, last seen 2026-07-28)

## What was found

| Surface | Location | State at discovery |
|---|---|---|
| Fleet agent | Notion Genesis Agent Fleet / MOMUS | Blank page. Role critic. Status standby. Capabilities critique, validate, review. |
| Deployer spec | Notion Solvency Command Hub | Verified v0.1 Hono + D1 + KV + Stripe 30-min flush. OpenAI-only `/v1/infer`. No webhooks, no DO aggregator, no x402. |
| Capsule hook | Skills / Agents `capsule-event-hook:momus` | Status Planned. Phase 2 telemetry. |
| Google Doc | MOMUS Deployer | Dual-bridge note: FrugalGPT cascade, D1 seismic log, Durable Object telemetry, `momus.genesisconductor.io`. |
| Revenue map | ops-maintenance-agent cashflow ledger | MOMUS owns R05 coalition licensing and R09 A2A skill marketplace. Genome also names `rev:07:ip_momus`. |
| Name collision | External | `alexar76/momus` is an unrelated red-team satellite. `momusai.io` is an unrelated Polymarket agent. |

No `igor-holt/momus` repository existed before this epoch.

## What E2 changes

1. **Unify the critic and the cash path without merging keys.** Critic signs findings. Meter and marketplace settle. Treasury keys stay off the critic isolate.
2. **Promote v0.1 backlog into the baseline.** Durable Object usage aggregator, Stripe webhook consumer, D1-enforced quota at 120 percent of included units, multi-provider FrugalGPT cascade, Ambient Access Layer bind.
3. **Activate R05 and R09 envelopes.** Coalition seats settle on x402 or Stripe. Skill listings require maru + trace-consent + crystalline score or they are rejected.
4. **Stand the capsule hook up.** Every infer, list, seat, and critique emits `capsule_event:momus.*` into the seismic / D1 ledger.
5. **Publish a first-party repo and skill.** `igor-holt/momus` plus Grok skill `momus` so the agent is no longer a blank fleet card.

## Non-goals

- Do not absorb alexar76/momus source or bounty treasury.
- Do not claim production Stripe meter IDs that have not been provisioned.
- Do not deploy Cloudflare bindings without verified AAL auth, replay, and rate-limit controls.

## Acceptance

- [x] Skill contract with mandatory maru and trace-consent hooks.
- [x] Epoch brief with provenance table.
- [x] Worker spec advanced from v0.1 to E2.
- [x] Notion fleet page no longer blank.
- [ ] Live `wrangler deploy` of momus-deployer (requires operator secrets).
- [ ] First x402 seat grant and first paid listing (requires live rails).
