# REINA Backend and Administration Architecture

Status: design for review, not deployed infrastructure or finished implementation. Implements the direction in [product specification](reina-product-spec.md). Singapore-first regional hosting is accepted; exact cloud vendor, costs, production sizing, and provider integrations require review. Stack below is the proposed implementation baseline, not a claim that dependencies have been installed.

## 1. Stack and Service Boundaries

- TypeScript for backend and shared domain code; Node.js 24 LTS baseline, exact supported patch pinned during scaffold.
- Fastify API for accounts, inventory, decks, commerce, matchmaking tickets, and administration.
- PostgreSQL 17 baseline, managed in Singapore; Drizzle ORM and version-controlled SQL migrations. Constraints and transactions enforce invariants, not ORM hooks alone.
- Regional Node.js WebSocket game service runs authoritative duel state and timers. One match has one authoritative owner; clients submit intents only.
- Next.js administration app, separate origin and deployment from the public game UI; use the supported repository version initially and audit before release.
- Redis is optional initially. Add for cross-instance presence, queue coordination, or rate counters when measured needs justify it; never authoritative inventory or currency storage.
- Object storage/CDN for artwork and archived replays. Store asset metadata and version references in PostgreSQL.
- Authentication supports email and Twitter. Identity provider/library and email login method remain review decisions; require verified provider subjects, secure linking, and session revocation. No homegrown OAuth implementation.
- Use a modular backend initially, not a fleet of independent microservices. API and long-lived game processes have separate deploy lifecycles; share reviewed domain packages.

SQLite/native HTTP work in PR #14 is an isolated prototype. Its tests inform PostgreSQL behavior; its schema, session issuance, and HTTP implementation are not approved production architecture. No migration of real player data exists because it has not been deployed.

## 2. Regional Topology

Initial deployment: Singapore game service, API, primary PostgreSQL and worker near one another. Public assets use CDN. US/EU are future regions, not launch commitments.

- Client probes available regional endpoints and chooses a supported low-latency region; server validates region eligibility. Initial selection resolves to Singapore.
- Matchmaking groups players within a region and rating range; rating expansion policy remains tunable and versioned. Never silently move an active duel across regions.
- Backend issues short-lived, single-use connection tickets bound to account, match, region, seat, and expiry. Browser receives no infrastructure secrets.
- Both players connect to the same match owner. Reconnect restores the same match and last acknowledged event sequence.
- One region can run multiple instances; scale on concurrent matches, event-loop delay, CPU, and connection pressure. Load tests determine capacity rather than an invented matches-per-instance number.
- Accounts, inventory, wallet links and rating are global. Regional servers never maintain independent spendable copies of balances.
- US/EU rollout requires measured latency, sufficient queue population, cross-region failure tests and an agreed data architecture. Do not assume a distant Singapore primary meets their write-latency needs.
- Graceful drain stops new assignments, preserves existing duels, and uses tested checkpoint recovery or verified no-contest if recovery is unsafe.

## 3. PostgreSQL Schema Map

Use UUID primary IDs unless a protocol requires another shape, UTC timestamps, foreign keys, explicit indexes, bounded text fields, and integer amounts. Never floating-point currency. JSONB is reserved for versioned effect payloads and snapshots, not balances or ownership constraints.

| Tables | Main fields and invariants |
| --- | --- |
| accounts | id, status, display_name, created_at; ban/deletion state checked on protected operations |
| auth_identities | account_id, provider, provider_subject; unique(provider, provider_subject); never link by matching unverified email alone |
| sessions | account_id, token_hash, expiry, revoked_at, credential_version; no plaintext tokens |
| account_progress | account_id, exp, tutorial_version_completed; EXP independent of rating |
| card_definitions / card_versions | stable gameplay identity, category Hero/Spell/Trap, subtype, rarity, level, ATK/DEF, effect schema version, ruleset; published versions immutable |
| card_artworks | gameplay identity, asset reference, license/provenance, review status; variants share copy limits |
| archetypes / card_archetypes | group membership and versioned synergy metadata |
| fusion_recipes | result version, material predicates, allowed sources, destinations, effect references; approved schema only |
| inventory_items | id, owner_account_id, gameplay identity/artwork, acquisition reference, state, revision; individually identifiable copies for future trade/NFT locks |
| item_locks | item_id, purpose, reference, expiry when appropriate; enforce incompatible reservations, never release merely because a client says so |
| decks / deck_slots | owner, revision, name, zone, position, item_id; ownership and validity rechecked on save and duel acceptance |
| tutorial_events / quest_progress | account, version, objective, progress; server-verified events, idempotent completion |
| reward_claims | account, reward_definition, period, operation_id; unique claim key; initial quest rewards EXP/cosmetics only |
| currency_accounts / currency_entries | account, paid-or-conversion bucket, integer balance and append-only entries; nonnegative balance; no withdrawal initially |
| operations | principal, type, idempotency_key, request_hash, status, result; unique scoped key; changed payload under same key rejected |
| pack_versions / pack_entries | card pool, exact probabilities, guarantee algorithm, price, publication state; immutable purchase version |
| payment_orders / payment_events | provider reference, account, amount, currency, verified settlement state; provider event IDs unique |
| pack_openings / opening_items | account, pack version, operation, committed outcomes; never reroll after retry |
| matchmaking_tickets | account, deck revision, region, state, expiry; at most one active queue/duel participation per account |
| matches / match_players | region, owner lease/fencing epoch, ruleset, participants, accepted deck snapshots, lifecycle |
| match_events / match_checkpoints | match, sequence, command ID, schema version, state hash; unique sequence and per-player command key |
| match_results / rating_entries | unique match result, outcome, algorithm version; rating application once per result |
| region_config / feature_flags | versioned region enablement, rollout and maintenance state; changes audited |
| admin_roles / admin_grants / admin_audit | least-privilege assignments, immutable action trail and approval references |
| outbox | committed domain event ID, payload version, delivery state; deduplicated worker delivery |

SQL constraints cover identity, uniqueness, ownership references and simple ranges. Cross-row deck limits and item eligibility require transactional service validation. Lock account/affected rows in deterministic order and retry bounded serialization/deadlock failures. Saved-deck membership blocks duplicate conversion; a card may appear in multiple saved decks but cannot be consumed or transferred while referenced. Active-duel reservations remain separate from saved-deck references.

## 4. Trusted API Contracts

Version API as /v1. Validate request/response schemas; reject unrecognized mutation fields. Derive account from verified session, never submitted account_id. Use explicit request limits, per-account/IP throttles, origin checks and CSRF protection where cookies authenticate mutations.

- Account/session endpoints: login callback, logout, session list/revoke, profile. Provider credentials live only in managed secrets.
- Inventory: owner-scoped pagination, filters, card details; no public arbitrary grant endpoint.
- Decks: create/update with expected revision, inspect validity and errors, select active; legacy 20-card records remain recoverable and invalid until explicitly edited.
- Queue: create/cancel ticket with validated deck revision; return regional connection ticket after assignment.
- Tutorial/quests: record only verified server milestones; never accept a client-supplied completed-ranked-gate flag.
- Shop: published offers/odds, order initiation, opening result, conversion preview/confirm. Price, RNG result and rewards never supplied by client.
- WebSocket commands: command_id, match_id, expected sequence and typed intent. Server authenticates seat, phase, ownership, legal targets, cost, and timing. Reject unknown or stale actions without state mutation.
- Admin endpoints live under separate access policy; admin UI visibility is not authorization.

Return stable error codes with safe details and correlation IDs. Authentication errors reveal no inventory. Idempotent retries return the committed result; conflicting payloads return conflict. Do not expose a diagnostic ownership endpoint as production authorization.

## 5. Transactions and Commerce

- Starter grant: one operation per eligible account; approved balanced recipe, 30 Main Deck cards and one compatible Fusion Hero; grant and completion marker atomically committed.
- Deck save: expected revision, owned item checks, 30/5 zone rules and gameplay-identity copy counts. No silent replacement on stale revisions.
- Queue acceptance: atomically validate current inventory, reserve eligible cards, enforce tutorial/ban gates, capture immutable deck and card-version snapshots.
- Pack opening: server CSPRNG chooses from published probabilities and guarantee algorithm; currency debit, item grants, opening result and outbox commit together. A retry never spends or draws again.
- Payment: verify webhook signature and amount/currency/order identity; credit once for confirmed settlement, not a client redirect. Out-of-order events and refunds require explicit state transitions and audit.
- Duplicate conversion: quote tied to inventory revision and conversion-rule version; confirm then atomically consume only eligible unreferenced/unlocked items and credit conversion currency.
- Ledger reconciliation checks balance changes against entries; admin correction uses compensating entries rather than editing history.
- NFT import/export and account transfer are deferred; retain stable item IDs and explicit lock states without inventing bridge semantics now.

## 6. Authoritative Duel Lifecycle

Pure deterministic rules engine consumes validated commands and emits events. RNG uses server-generated committed outcomes; clients cannot determine shuffle order. Store ruleset/card versions with match. Hidden hand/deck data must be redacted per recipient; full replay access follows authorization.

- One match owner lease with monotonically increasing fencing epoch; stale owners cannot append events or finalize results.
- Acknowledge accepted commands only after recoverable event persistence. Retries deduplicate by match/player/command ID. State changes and sequence increments commit consistently.
- Snapshot/checkpoint plus ordered event replay supports tested process recovery. Timers use authoritative deadlines with persisted pause budgets, not client countdowns.
- 90-second turns, 15-second opponent response window with active timer paused, 60-second cumulative disconnect allowance per player. Resolve mandatory choices deterministically and chains before timeout End Turn.
- Terminal resolution handles simultaneous lethal draw, surrender, required-draw failure and disconnect once. Verified service failure may mark no-contest; never arbitrarily award a win during recovery.
- Final result and rating application have uniqueness/idempotency guarantees; rating algorithm remains unapproved. Do not invent MMR deltas.
- Deploy drain and ruleset pinning prevent mid-duel behavior changes. Do not hot-edit a running duel's cards, LP, or RNG through administration.

## 7. Admin Panel

Admin panel is required product scope, not an optional debugging screen. It provides operational control through guarded workflows rather than unrestricted database editing.

### Modules

1. Overview: player/queue counts, active matches, regional latency, errors, payment and ledger alerts.
2. Accounts: search, status, reports, session revocation, bans with reason/expiry, appeal history. Mask personal identifiers by default.
3. Card CMS: Hero/Spell/Trap definitions, artwork, rarity, archetypes, Fusion recipes, previews, schema validation and draft/review/publish workflow.
4. Collections/decks: inspect ownership and revisions, invalid-deck diagnostics, item lock history. Exceptional grants/removals require reason, approval and ledger/operation records.
5. Shop/economy: pack pool, odds, guarantee, prices, conversion rules, payment settlement and reconciliation. New versions apply to future purchases, not committed openings.
6. Tutorial/quests: guide steps and assistant knowledge revisions, objective/reward definitions, scheduling; prevent unsupported card/currency quest rewards.
7. Ranked/matches: queue health, redacted replay/result inspection, disconnect diagnostics, dispute cases, audited no-contest/correction requests. No arbitrary live gameplay intervention.
8. Regions/operations: region availability, admission controls, maintenance banners, feature flags and graceful drain. Infrastructure credentials remain outside UI.
9. Audit/security: privileged access changes, login events, approvals, action diffs and export access.

### Authorization and High-Risk Actions

- SSO plus MFA mandatory for staff; separate staff sessions, short elevated-action lifetime, revocation and server-side authorization on every request.
- Roles: support (limited account/dispute read), content editor (drafts), economy operator (proposal), game operator (queues/maintenance), auditor (read-only), security administrator (access control). Explicit permissions override broad labels.
- Dual approval for currency/item compensation, economy publication, staff privilege changes and destructive/bulk operations. Requester cannot approve own action. Any later simplification requires explicit review.
- Confirmation shows affected scope, reason and expected impact; dry-run bulk operations first. Exports and impersonation are off by default; never expose session tokens, keys or payment secrets.
- Append-only audit records actor, approver, target, before/after diff, reason, timestamp, request ID and result. Export audit logs to separately controlled storage to resist database-admin tampering.
- No generic SQL console, arbitrary code/effect execution, public file upload execution, or unrestricted database delete button.
- Assistant knowledge derives from published rules; uploads/content are untrusted data, not executable instructions. AI has no admin mutation privileges.

## 8. Infrastructure, Security and Operations

- Separate development/staging/production projects, databases, secrets and admin access. Synthetic data only in tests.
- Managed PostgreSQL private networking, TLS, least-privilege service users, encrypted backups, point-in-time recovery and scheduled restore drills. Define RPO/RTO before launch; do not promise unmeasured recovery times.
- Dedicated long-lived container/VM game hosts, not request-only serverless functions. API may use containers; exact host/vendor/budget remain open.
- CI: type/lint, domain tests, API auth/authorization tests, PostgreSQL integration/concurrency tests, migration checks, dependency/secret scan and builds. Pin lockfiles/runtime images.
- Expand/contract migrations; backup and staging rehearsal before destructive migration; rollbacks cannot discard player transactions silently.
- Metrics: rejected actions, event persistence latency, queue age, reconnect usage, duplicate operations, ledger drift, event-loop delay and admin mutations. Sanitize logs; no raw access tokens or hidden player hands in ordinary logs.
- WAF/rate limits, WebSocket message/connection caps, bounded payloads, heartbeat and backpressure, login abuse controls, webhook replay defense.
- Repository-root deployment guard verifies project/team/environment. Existing stable UI alias changes require explicit deployment work; this design PR does not redeploy it.

## 9. Severity-Ordered PR Delivery

| Priority | Deliverable | Acceptance gate |
| --- | --- | --- |
| P0 | Confirm stack, scaffold PostgreSQL/Drizzle schema and migrations | Empty DB and migration upgrade verified; constraints/concurrency tests; no SQLite production dependency |
| P0 | Verified email/Twitter auth and staff SSO/MFA boundaries | Forged/expired/revoked/cross-account requests denied; no public session minting |
| P0 | Ownership, operations, currency ledger and outbox | Atomic rollback, replay, concurrent spend, starter uniqueness, backup/restore tests |
| P0 | Authoritative duel commands and results | No client result authority, replay-safe state transitions, owner fencing and one-time terminal result |
| P1 | Full rules/Fusion/decks and reservations | Agreed 30-card/5-slot/tribute/chain rules, stale editor rejection, no inventory loss |
| P1 | Admin security/audit shell and account/content workflows | RBAC bypass denied, MFA required, separation of duties, immutable published versions |
| P1 | Regional queue/reconnect/deploy drain | Singapore load/latency evidence, reconnect recovery, no double match owner |
| P1 | Production resilience and observability | Restore drill, secret hygiene, failure injection, deployment safeguards |
| P2 | Tutorial, quests, remaining admin screens and public UI integration | Ranked gate verified; actual server data, accessibility and responsive tests |
| P2 | Shop settlement and economy administration | Approved rates/prices/provider, transparent odds, atomic audited settlement |
| Deferred | US/EU, events, secondary NFT and account NFT | Population/latency and product approvals; account NFT last |

Implementation order follows dependencies: establish minimal command/result authority before expanding full battle rules; do not ship ranked until its P0/P1 gates pass. Admin access/audit foundations precede any privileged production mutation. Estimates and version pins are finalized during implementation, not invented here.

## 10. Decisions Still Needed Before Production

Exact cloud vendor/plan and budget; managed DB version availability; auth/SSO providers and email method; initial card/effect catalog; MMR algorithm; pack prices/rates and payment provider; moderation/retention policy; RPO/RTO; measured game-instance capacity. These do not block architecture review, but remain explicit launch gates.
