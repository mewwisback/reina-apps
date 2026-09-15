# PostgreSQL Foundation

Approved stack scaffold: TypeScript, Fastify, PostgreSQL and Drizzle. No SQLite dependency. This is a partial draft, not a working database-backed product.

From this directory: `npm ci`, `npm test`, `npm run typecheck`, `npm run dev`.

Runtime target: Node 24 LTS; current verification used Node 26.8.1. Exact package versions are pinned in package.json/package-lock.json. The existing monorepo uses pnpm; reconcile package-manager lock strategy before merge.

GET /health reports liveness and databaseReady=false. No auth or ownership routes are exposed. Drizzle schema and SQL migration define accounts and unique provider-subject identities. Provider login is not implemented.

## Internal Inventory Primitive

`consumeItems` accepts a dedicated PostgreSQL client and a trusted account identity. It locks the account and item rows, verifies ownership and available state, updates items and records a scoped operation hash in one transaction. Identical concurrent retries apply once; changed payloads conflict. No HTTP mutation endpoint is exposed. This is not duplicate conversion: currency credit, saved-deck references, authentication and admin authorization are still required before use by a product workflow.

## Verification and Blocker

Fastify injection regression passed after a failing 404 baseline. TypeScript check passed. npm install audit reported zero vulnerabilities at execution time.

Docker remains inaccessible, but the database test now runs real PostgreSQL 17 through pinned dev-only embedded-postgres 17.10.0-beta.17, without Docker or system service changes. It creates a disposable cluster on localhost:15439, applies the SQL migration, inserts/reads through Drizzle, verifies duplicate provider-subject rejection (23505) and missing account rejection (23503), then stops and removes the cluster. This is native PostgreSQL, not an in-memory SQL emulator. The fixed test port must be free; do not run this suite concurrently on the same host.

Fresh gates: 2 tests passed and TypeScript passed on Node 26.8.1. Migration tracking now verifies SHA-256 checksums, applied-history prefixes, repeated no-op execution, incremental upgrades and transactional rollback on real PostgreSQL. A transaction-scoped advisory lock serializes runners. Two independent PostgreSQL connections concurrently applying the same upgrade returned exactly one applied migration and one no-op. Fresh tests and typecheck also passed on Node 24.21.0. Concurrent bootstrap on an empty database is also verified: two independent PostgreSQL connections produce exactly one applied migration and one no-op. Both bootstrap and upgrade checks pass on Node 24.21.0. Internal migrate(client, entries) owns the transaction; reviewed SQL must not contain transaction-control statements. Use npm test for migration verification, not direct psql application that bypasses history. AGENTS.md still lists the superseded direct-psql command: its correction was blocked by an approval timeout and was not bypassed. No deployed infrastructure, frontend changes, or production readiness claimed.
