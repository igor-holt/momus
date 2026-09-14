# MOMUS connector bindings — Epoch E2.1

## Cloudflare (live)

| Resource | Identifier | Notes |
|---|---|---|
| Account | `04c59c95ce8d0a0be98099b7f7e39d18` | Iholt@mymail.aacc.edu |
| Worker | `momus-deployer` | Health isolate, fail-closed `/v1/*` |
| Workers.dev | https://momus-deployer.iholt.workers.dev/v1/health | 200 |
| Custom host | https://momus-e2.genesisconductor.io/v1/health | 200, bindings present |
| D1 `momus-usage` | `4990cb80-e17f-4e43-bc4f-e8b648040ee1` | Schema applied |
| KV `MOMUS_API_KEYS` | `c844f44eabff4e8c87f22906a18c654b` | Empty until keys minted |
| KV `MOMUS_METER_CURSOR` | `fef4a970f1454b279d116785e89f620d` | Empty until first flush |
| Pre-existing host | `momus.genesisconductor.io` | Bound to `diamond-vault-remote` — not overwritten |
| Pre-existing worker | `momus-sgb-igniter` | Anthropic secret only; left untouched |

Ambient Access Layer worker `ambient-access-layer` already exists on the same account. Production infer/list/seat traffic should route through it after secrets land.

## GitHub (live)

- Repo: https://github.com/igor-holt/momus
- Issues: #1 Cloudflare secrets/AAL, #2 Law clickwrap review

## Law (live)

- CourtListener weekly alert id `22910` for clickwrap and Maryland forum language.
- Memo: `docs/LEGAL-E2.md`

## Com (Composio)

Composio search ran for GitHub issue-create and Cloudflare DNS. Those Composio toolkits had no active connection. Native GitHub and Cloudflare connectors were used instead.

## Cloud (Google Cloud)

`gcloud` connector returned auth-required / client timeout. No GCP mutation was performed.
