# Reina Apps

Monorepo for the Reina application.

## Structure

```
apps/
  web/    Next.js frontend (Vercel root directory)
  server/ Backend API (placeholder, not built yet)
```

## Dev

```bash
pnpm install
pnpm --filter @reina/web dev
```

## Stack

- pnpm workspaces
- Next.js 15 (App Router) + React 19
- TypeScript
