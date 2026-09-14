# Backend Development

## Overview
REINA deck-validation API with optional SQLite store. Node.js >=22.13, native ESM HTTP and tests, no dependencies. Workspace package manager: pnpm 9.15.0.
## Commands
- Setup: no installation required for this service.
- Dev: `node apps/api/server.mjs`
- Test: `node --test apps/api/*.test.mjs`
- Syntax: `node --check apps/api/server.mjs`
- Build: none; native ESM.
## Conventions
Validate external JSON before processing: `Number.isSafeInteger(value)`.
## Boundaries
**NEVER** commit secrets or `.env`, alter production config, or treat submitted inventory as verified ownership.
**ALWAYS** resolve inventory from the trusted store when configured. Session issuance requires verified identity; provider login remains unimplemented.
**IMPORTANT** localhost only by default; public deployment requires authentication and rate limiting.
## Dependencies
Node.js standard library: HTTP, SQLite, crypto, assertions, test runner.
## Config
No required environment variables. Local port 3100. Client supplies catalog/inventory for consistency checks only; canonical catalog is not approved yet.
## Error Handling
Malformed and oversized requests return bounded JSON errors. No persistence or retries.
## Troubleshooting
- Port busy: stop only an owned process; tests use ephemeral ports.
- Invalid JSON: send an application/json object.
- Invalid deck: inspect errors; artwork variants must use the same cardId.
- Ownership: this endpoint cannot authenticate inventory claims.
