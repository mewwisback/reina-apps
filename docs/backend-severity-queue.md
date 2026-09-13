# Backend Severity Queue

Severity describes impact if integrated, not proof of an active production exploit. The API remains localhost-only, unintegrated, and draft.

## P0: Critical Production Blockers

1. Authenticated identity and server-owned catalog/inventory. Never authorize play from submitted ownership claims. Current mitigation: validation endpoint fails closed by default; explicit diagnostic mode is test-only, not authorization. Authentication/storage remain unimplemented.
2. Transactional ownership and currency changes with idempotency. No purchases, conversion, transfers, or starter grants may ship before atomicity and replay tests.
3. Server-authoritative battle transitions and exactly-once result recording. Reject client winner/LP/clock claims; no ranked integration until action validation, terminal resolution, and replay protection exist.

## P1: High

- 30-card deck and Fusion validation against trusted catalog, immutable match snapshots, explicit 20-card legacy recovery.
- Deterministic chain, tribute, damage and simultaneous-terminal tests; 90-second turns, 15-second response windows, cumulative reconnect clocks.
- Auth session expiry/revocation, cross-account authorization tests, request throttling, bounded connections and deployment controls.
- Persistence migrations, backup/restore verification, concurrency tests.

## P2: Medium

- Starter recipe generation, inventory/Deck Builder integration, tutorial and ranked-entry gate.
- Rating mechanics after approval; economy after catalog/rates/payment decisions.
- Observability with sanitized logs; UI integration alongside working features.

## Deferred

NFT integration and account NFTs; unrelated visual polish. Existing Arena roadmap must be reconciled separately before claiming old items remain unfixed.

## Current Evidence

Regression reproduced a default 200 response to self-declared ownership. It was a consistency response with ownershipVerified=false, not authenticated approval. Default now returns 503 until trusted services exist. Diagnostic HTTP tests remain opt-in. This mitigation does not complete authentication or persistence.
