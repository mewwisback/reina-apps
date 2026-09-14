# Backend Foundation
## Overview
TypeScript 7.0.2, Fastify 5.12.4, Drizzle 0.45.2, pg 8.23.0; Node 24 LTS target. pnpm workspace, package-local npm lock for this initial isolated scaffold.
## Commands
From apps/api: `npm ci`, `npm test`, `npm run typecheck`, `npm run dev`.
Migration: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/0001_accounts.sql`.
## Conventions
Typed schema exports: `export const accounts = pgTable(...)`.
## Boundaries
**NEVER** commit credentials, databases, or `.env` files. **ALWAYS** keep auth-dependent routes closed until authentication exists. No production deployment in this scaffold.
## Dependencies
Fastify HTTP; Drizzle typed PostgreSQL schema; pg transport; tsx test/dev runner.
## Config
DATABASE_URL is reserved for database integration; example placeholder `${DATABASE_URL}`. Health server binds localhost port 3100.
## Error Handling
Health reports liveness only, not database readiness. Unknown routes return 404.
## Troubleshooting
- Docker permission denied: use authorized PostgreSQL host; never change socket permissions.
- Missing dependencies: run npm ci.
- Port conflict: stop only the owned process.
- Migration test requires real PostgreSQL; typecheck is not a substitute.
