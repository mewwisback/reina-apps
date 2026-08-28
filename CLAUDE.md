# Reina Apps Agent Guide

## Overview
Reina Apps is a pnpm 9.15.0 monorepo using Node.js 22+, Next.js 15.3, React 19.1, and TypeScript 5.7. The active product is `apps/web`; `apps/server` is a placeholder.

## Commands
- Setup: `pnpm install`
- Development: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Arena rules: `pnpm --filter @reina/web test:arena`
- Production start: `pnpm --filter @reina/web start`

## Conventions
Use strict TypeScript, React function components, immutable state updates, and Conventional Commits. Keep deterministic Arena rules in `rules.mjs` with matching declarations and tests.

```ts
const nextFront = [...side.front];
nextFront[index] = { ...card, used: true };
```

## Boundaries
- **NEVER** commit `.env*`, credentials, tokens, `.vercel/`, or customer data.
- **NEVER** edit generated output, dependency directories, or lockfiles without a dependency change.
- **NEVER** deploy from `apps/web`; deployment must use a verified repository-root command.
- **ALWAYS** stop Arena state transitions immediately after a terminal result.
- **ALWAYS** add deterministic tests when changing gameplay rules.
- **IMPORTANT**: preserve the Next.js App Router and pnpm workspace layout.

## Dependencies
- `next@^15.3.0`: App Router and production web runtime.
- `react@^19.1.0` / `react-dom@^19.1.0`: UI runtime.
- `framer-motion@^12.0.0`: motion and transitions.
- `lucide-react@^0.469.0`: icon components.
- `swr@^2.4.1`: remote data fetching.
- `zustand@^5.0.13`: shared client state when local state is insufficient.

## Config
No environment variables are currently required. Add placeholders such as `${API_BASE_URL}` to `.env.example`; never document real values.

## Error Handling
Surface invalid actions through the Arena message region. Clamp LP at zero, resolve a winner once, cancel pending async work after terminal state, and fail builds/tests with non-zero exit status.

## Troubleshooting
- `pnpm` version mismatch: run `corepack enable` and use pnpm 9.15.0.
- Unsupported Node.js: install Node.js 22 or newer.
- `next lint` fails under newer Next.js: keep Next.js 15.3 until lint tooling is migrated.
- Arena regressions: run `pnpm --filter @reina/web test:arena` before browser tests.
- Wrong Vercel project: stop; relink from repository root after verifying `.vercel/project.json`.
