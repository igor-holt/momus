# MOMUS DSAR fulfillment — Epoch E2.1

**Governing clock:** Maryland Online Data Privacy Act (MODPA), effective 1 October 2025.
**Secondary clocks:** GDPR Art. 12/15/17/20 (30 days); CCPA/CPRA (10-day acknowledgment, 45-day fulfillment, 15-day opt-out).
**This memorandum is operational research, not legal advice.**

## Rights LOCKE-D

Maryland residents may Limit, Opt out of sale/sharing, Correct, Know/access, receive Equal treatment, and Delete. Controllers must also support portable copies. MOMUS maps those verbs onto `/v1/privacy/dsar`.

## Automated path

1. `POST /v1/privacy/dsar` records the request, hashes the email, issues a verify token, and computes clocks.
2. `POST /v1/privacy/dsar/:id/verify` marks identity confirmed. No package is emitted before this step.
3. `POST /v1/privacy/dsar/:id/discover` walks the seeded inventory.
4. `POST /v1/privacy/dsar/:id/fulfill` emits an access/port package or applies delete / opt-out / correct.
5. `GET /v1/privacy` publishes the consumer notice required by MODPA.

## Live surfaces

- Notice: https://momus-e2.genesisconductor.io/v1/privacy
- Intake: POST https://momus-e2.genesisconductor.io/v1/privacy/dsar
