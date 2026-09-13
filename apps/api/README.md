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

## Next Steps

Replace submitted catalog and inventory with authenticated server-side records before integration. Add persistence, transaction-safe ownership, versioned deck snapshots, and auth only in reviewed follow-ups. Canonical card definitions remain undecided. No fake production catalog is bundled.

This slice does not implement Fusion resolution, matchmaking, clocks, battle actions, starter generation, authentication, storage, payment, or NFTs. Frontend and live deployment remain unchanged.
