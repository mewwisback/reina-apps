# REINA Deck Consistency API

Initial backend slice, not a production ranked service. Node.js >=22, no dependencies.

Run from repository root:

```sh
node apps/api/server.mjs
node --test apps/api/server.test.mjs
curl http://127.0.0.1:3100/health
```

By default, `POST /v1/decks/validate` returns 503 until trusted identity/inventory services exist. The CLI does not enable diagnostics. Tests explicitly use `createServer({allowUntrustedDiagnostics:true})`; this is untrusted consistency checking only, never authorization.

Diagnostic contract: `POST /v1/decks/validate`, `Content-Type: application/json`, maximum 65536 bytes:

```json
{
  "catalog": [{"id": "hero-a", "zone": "main"}, {"id": "fusion-a", "zone": "fusion"}],
  "inventory": [{"cardId": "hero-a", "count": 2}],
  "main": [],
  "extra": []
}
```

This abbreviated example deliberately fails validation: Main Deck must have exactly 30 canonical card IDs. Extra Deck accepts at most five Fusion cards. Each identity permits at most two copies; artwork variants must map to the same identity. IDs use 1–80 ASCII letters, digits, underscores or hyphens. Catalog/inventory entries must be unique, with at most 1000 each. Inventory counts are nonnegative safe integers.

Responses: 200 valid, 422 invalid, 400 malformed JSON, 413 oversized, 415 unsupported media type, 404 unknown route. Results always include `ownershipVerified: false`: submitted catalog and inventory are untrusted claims. This endpoint must never authorize ranked entry, purchases, or asset transfers.

## Trusted Store Slice

`openStore(path)` from `store.mjs` uses native `node:sqlite` (Node >=22.13; exercised on Node 26.8.1). Tables enforce inventory uniqueness, foreign keys, and nonnegative integer counts. `createServer({store})` accepts only `main`/`extra`; it resolves catalog and inventory from the database using an expiring, revocable Bearer session. Tokens are random 256-bit values stored only as SHA-256 hashes. Valid results indicate ownership at validation time, not a reserved match snapshot.

Session issuance is an internal function only. No email/Twitter login provider, public session-creation endpoint, catalog seeding, or starter grant is supplied. The CLI remains fail-closed without a store. DB paths must point to private service storage; never commit databases. Tests use synthetic fixtures only.

Run all tests: `node --test apps/api/*.test.mjs`.

## Atomic Inventory Operations

Internal `applyInventory(accountId, operationId, changes)` applies up to 100 unique card deltas in one `BEGIN IMMEDIATE` transaction. An identical retry returns `replayed: true` without changing counts; a reused ID with different normalized content fails. Insufficient cards, overflow, or foreign-key violations roll back all changes and the operation record. This function has no public HTTP route: only trusted services may determine deltas.

This is not currency settlement, deck-lock enforcement, starter generation, or NFT transfer logic. A purchase must eventually commit currency and inventory together, not call this function after an unrelated balance debit. Tests currently establish atomic rollback and sequential replay behavior, not multi-process contention or crash recovery.

## Next Steps

Replace submitted catalog and inventory with authenticated server-side records before integration. Add persistence, transaction-safe ownership, versioned deck snapshots, and auth only in reviewed follow-ups. Canonical card definitions remain undecided. No fake production catalog is bundled.

This slice does not implement Fusion resolution, matchmaking, clocks, battle actions, starter generation, authentication, storage, payment, or NFTs. Frontend and live deployment remain unchanged.
