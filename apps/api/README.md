# PostgreSQL Foundation

Approved stack scaffold: TypeScript, Fastify, PostgreSQL and Drizzle. No SQLite dependency. This is a partial draft, not a working database-backed product.

From this directory: `npm ci`, `npm test`, `npm run typecheck`, `npm run dev`.

Runtime target: Node 24 LTS; current verification used Node 26.8.1. Exact package versions are pinned in package.json/package-lock.json. The existing monorepo uses pnpm; reconcile package-manager lock strategy before merge.

GET /health reports liveness and databaseReady=false. No auth or ownership routes are exposed. Drizzle schema and SQL migration define accounts and unique provider-subject identities. Provider login is not implemented.

## Verification and Blocker

Fastify injection regression passed after a failing 404 baseline. TypeScript check passed. npm install audit reported zero vulnerabilities at execution time.

Real PostgreSQL migration/constraint execution is BLOCKED: Docker socket access is denied, and PostgreSQL binaries are absent from PATH. An embedded PostgreSQL version lookup also failed. Do not treat SQL or Drizzle compilation as database verification. The migration is unverified and must not be applied to production.

To complete: provide an authorized local PostgreSQL instance or approved connection, run migration against a disposable DB, verify foreign-key and provider-subject uniqueness rejection, then add durable integration tests and migration tracking. No deployed infrastructure, frontend changes, or production readiness claimed.
