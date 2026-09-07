# Reina Arena Entry Redesign Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task. Check skill availability before execution; if unavailable, use explicit task delegation and review gates.

**Goal:** Replace the dashboard-to-Arena experience through first interactive duel frame with an original, game-native Reina flow.

**Architecture:** Keep existing combat rules intact. Separate pre-duel presentation and transition state from combat lifecycle. Loading reflects route or asset readiness; matchmaking remains explicitly simulated until a real service exists.

**Tech Stack:** Existing pnpm workspace, Next.js 15, React 19, TypeScript, CSS, existing GSAP where justified, Node test runner and Playwright. Manifest ranges are not verified installed versions. No new animation or state-machine package planned.

---

## Scope and acceptance boundary

Included: dashboard Arena entry, route preparation, mode selection, queue start/cancel, opponent reveal, duel preparation, and first interactive battlefield frame.

Excluded: battlefield redesign after entry, balance, deck-builder rules, real multiplayer backend, monetization, rankings implementation, other dashboard sections.

Stop at the first actionable player state. Do not change opening draw rules or combat scheduling to achieve a visual effect.

## Verified baseline and review limits

- Local HEAD: e7cf6d4, branch redesign/arena-game-ui. Checkpoint identifies production source 4f5f3ab.
- Checkpoint: checkpoints/reina-production-checkpoint-2026-09-06.md.
- GitHub read verified PRs #2, #3, #4, #5 merged; #1, #6, #7 open. No PR modified during this planning pass.
- Existing untracked artifacts/ and root index.js must remain untouched.
- Source reviewed: arena/page.tsx, arena/loading.tsx, dashboard/page.tsx, web/package.json, playwright.config.mjs, docs/reina-design-identity.md.
- Historical desktop battlefield screenshot inspected. It includes a summoned card and is NOT evidence of the initial duel frame.
- Live browser unavailable: configured Camofox endpoint refused connection. Live flow, mobile lobby, motion and loading visibility remain unverified.
- Prior checkpoint reports 231 Playwright passes and 28 unit passes; these were not rerun for this plan and are not current acceptance evidence.
- PR metadata/file lists reviewed; complete historical diff review remains milestone M0.

## Initial source findings

1. High: arena/page.tsx:13-17,39,129,149 displays hardcoded live counts, latency, rank, wait estimates and opponent records. Search completes after 4200 ms and uses a fixed opponent. Preserve demo behavior honestly; do not imply network-backed matchmaking.
2. High: mode buttons immediately start search (page.tsx:129). Separate selection from commitment: select mode, inspect consequences and selected deck, then explicit queue CTA.
3. Medium: arena/loading.tsx:1-7 already provides a spinner. App Router loading alone cannot guarantee a visible transition on prefetched/cached navigation and does not represent duel asset readiness.
4. High: accept() at page.tsx:41 immediately deals cards and enters duel; opening at lines 42 and 45 overlaps a timer and combat draw effect. New reveal must not duplicate initialization, skip draws, or allow actions beneath an overlay.
5. Medium: dashboard identity is Kaiba99 / Gold III (dashboard/page.tsx:80-81), while Arena uses REINA and a Diamond II context. Carry one explicit session identity through entry, or label demo identities rather than silently swapping player identity.
6. Medium: lobby claims a valid 20-card deck while checkpoint records contradictory deck-builder requirements. Do not invent validation rules; demo deck label must not masquerade as persisted user deck validation.
7. Maintainability: lobby rendering shares a dense page with combat logic. Introduce only narrow pre-duel boundaries; no wholesale combat refactor.

## Design direction

Primary surface: Operate. Supporting searching state: Monitor.

Recommended direction: **Courtyard Threshold**. A coherent physical-card ritual: selected deck stays spatially anchored as the dashboard gives way to a courtyard lobby, opponent identity occupies the opposing side, and the same deck transitions into duel preparation.

Existing Reina vocabulary: void/aubergine, crimson, bone, restrained copper; Zen Old Mincho display, Zen Kaku Gothic New body, JetBrains Mono telemetry. Use current licensed environment imagery and card assets after inventory and crop review.

Avoid: SaaS tile grids, giant generic slogans, spinner as centerpiece, fabricated live telemetry, floating glass panels, arbitrary particles, tiny monospace body copy, decorative fake progress bars.

### Exploration deliverables before implementation

Produce three composition studies, not color swaps:
- Conservative: compact ruleset rail and dominant deck inspection area.
- Recommended: courtyard threshold with anchored deck, peripheral mode rail, opposing reveal position.
- Divergent: close tabletop composition with physical-card mode selection.

Compare desktop and phone compositions. Consolidate one direction after product-owner visual approval; do not ship all variants.

### Screen sequence

1. Dashboard entry: immediate pressed/pending feedback, preserve keyboard navigation and direct Link semantics.
2. Arena preparation: branded threshold frame when route/assets are pending. Cached navigation uses a short nonblocking continuity transition, not mandatory waiting.
3. Lobby: selected deck and selected ruleset dominate; one queue CTA. Show unavailable or demo-only modes honestly.
4. Search: stable deck anchor, elapsed time, selected mode, cancel. No percent or queue ETA without measured data. Explicit simulated-match label in current build.
5. Opponent found: real available opponent identity or clearly labeled demo opponent; concise versus composition, explicit Enter Duel and back/cancel where supported.
6. Preparing duel: actual essential asset readiness and initialization boundary; fallback for failed decorative art. Do not call fabricated server handshake stages.
7. Duel entry: short optional reveal; preserve one initialization and existing opening rules; first actionable state receives focus and clear turn context.

### Required GSAP motion direction

User requirement: GSAP is the primary animation framework throughout the scoped entry flow. Use its choreography capabilities extensively and deliberately; avoid repetitive generic fades, uniform slide-ins, and identical stagger patterns. Do not mix Framer Motion into this flow.

- Dashboard departure: coordinated shell recession and courtyard entrance, maintaining the deck as a visual anchor.
- Lobby selection: tactile card/deck movement, layered foreground/background response, and distinct active-mode emphasis. Hover motion must have equivalent focus feedback; no hover dependency on touch.
- Searching: restrained asynchronous environment movement and deck tension, not repeated full-screen pulses or an ornamental spinner. Ambient loops stop when hidden or when the state changes.
- Opponent reveal: anticipation, opposing directional arrival, a short impact accent and controlled settle. Identity text remains readable without waiting for the sequence.
- Duel entry: coordinated scene opening, deck-to-board continuity and ordered HUD reveal. Do not animate or replay actual card draws independently of combat state.
- Build scoped `gsap.timeline()` sequences with labels and overlapping beats; vary rhythm and easing by meaning, not randomly. Use `gsap.context()` with cleanup and `gsap.matchMedia()` for responsive/reduced-motion variants. Use `quickTo()` only for optional pointer-driven movement where it improves the chosen composition.
- State changes cancel or replace obsolete timelines. Timeline completion must never own match initialization, network success, or legal combat transitions. Cleanup must tolerate React Strict Mode.
- Prefer transforms and opacity for sustained motion; constrain masking/clipping and filters to small measured surfaces. Do not animate large blur layers or apply permanent will-change globally.
- No new plugins or animation dependencies without a demonstrated need. The existing GSAP dependency is sufficient for the planned choreography.
- Prototype review includes a motion storyboard listing each state's anticipation, action, settle, interruption behavior and reduced-motion equivalent. Review full recordings, not screenshots alone.
- Maximum GSAP usage means expressive, coherent game choreography, not maximum simultaneous movement. Preserve legibility, responsiveness and input control.

### Proposed motion budget, subject to prototype review

- Control feedback: 80-140 ms.
- Mode change: 160-240 ms; transforms/opacity only where possible.
- Route continuity: 180-280 ms, nonblocking when ready.
- Opponent reveal: 450-700 ms, skippable/reduced-motion equivalent.
- Duel reveal: 300-500 ms; ready state never depends exclusively on animationend.
- No forced 2-5 second cinematic loader. No new intentional matchmaking delay.
- Persist mute preference; sound only after user interaction. Audio failure never blocks flow.

## Research references and remaining work

Retrieved search results establish these references, not a completed deep visual study:
- https://www.gameuidatabase.com/index.php?scrn=181 — matchmaking lobby reference collection.
- https://www.gameuidatabase.com/index.php?scrn=186 — matchmaking search collection.
- https://www.masterduelmeta.com/articles/news/may-7-2025/master-duel-leaks — opponent titles and ranked-state context.
- https://nngroup.com/articles/progress-indicators — waiting feedback and meaningful progress.
- https://nngroup.com/articles/skeleton-screens — distinguish page loading from process status.

M1 must inspect actual game screens and record source, borrowed principle, rejected pattern and original Reina translation. Compare at least three relevant game flows. Do not copy proprietary assets or call search snippets a full visual audit.

## Timeline and artifacts

Effort estimates are focused working hours, not autonomous completion promises. Sequence starts after approval and access restoration; visual review turnaround is excluded.

| Milestone | Effort | Deliverable | Exit gate |
|---|---:|---|---|
| M0 Baseline and PR audit | 2-3 h | docs/arena-entry-audit.md; before screenshots/video under artifacts/arena-entry/baseline/ | Complete scoped PR diff review and reproduce dashboard, lobby, search, found, duel entry |
| M1 Research and art direction | 3-5 h | docs/arena-entry-design.md; three composition studies with sources | Product owner chooses composition, not palette only |
| M2 Clickable flow and motion | 4-6 h | Prototype in repo stack; storyboard and desktop/phone recordings | Owner approves all seven states, including errors and reduced motion |
| M3 State and loading correctness | 4-6 h | Typed entry transitions, readiness logic, focused unit/E2E tests | Cancel/retry/unmount/double-submit tests pass |
| M4 Production UI integration | 6-10 h | Approved lobby/search/reveal/entry and scoped CSS | Visual comparison accepted; combat behavior preserved |
| M5 Regression and release review | 4-6 h | artifacts/arena-entry/verification-summary.md; preview URL and before/after video | Full quality gates and explicit visual approval |

Total estimate: 23-36 focused hours, roughly 4-6 working days with review rounds. Asset production or real multiplayer service work requires a separate estimate.

## GitHub delivery strategy

Repository: https://github.com/mewwisback/reina-apps

Existing dependencies:
- #4: game-native matchmaking baseline; audit which transitions actually shipped.
- #5: async correctness and loading baseline; preserve cancellation/terminal fixes.
- #7: current checkpoint branch; do not merge solely because tests passed. Current owner dissatisfaction means visual acceptance is outstanding.
- #6: compare unique changes against #7 before closing or incorporating anything.
- #1: reconcile old roadmap only after the new accepted plan exists.

Proposed PR sequence, numbers intentionally unassigned:
1. **docs(arena): define entry experience redesign** — branch docs/arena-entry-redesign, base redesign/arena-game-ui. Planning artifact, initial audit, research and acceptance checklist only. Keep draft until direction is accepted.
2. **feat(arena): rebuild lobby and queue experience** — includes approved prototype translation, mode selection, honest simulation state, loading readiness and tests; based on the reconciled checkpoint branch.
3. **feat(arena): stage opponent reveal and duel entry** — stacked on previous implementation branch until merge; integrates reveal without combat-rule changes.

Every PR requires scope, dependency/base, screenshots for phone and desktop, interaction video, test commands with real outcomes, known limitations, rollback instructions and explicit visual acceptance checklist. Never update visual snapshots blindly to erase failures.

Planning-only restriction: no branch, commit, push or GitHub PR creation in this pass. The first execution action is publishing the documentation-only draft PR after confirming the chosen base. Do not report a planned PR as created.

## Technical implementation map

Existing files likely modified:
- apps/web/src/app/dashboard/page.tsx — Arena entry affordance only.
- apps/web/src/components/layout/app-shell.tsx — inspect alternate Arena entry links; change only if continuity requires shared behavior.
- apps/web/src/app/arena/loading.tsx — meaningful route fallback.
- apps/web/src/app/arena/page.tsx — narrow lobby integration and exactly-once duel entry boundary.
- apps/web/src/app/arena/arena.css — remove superseded pre-duel rules rather than append another override layer; preserve battlefield selectors.
- apps/web/src/styles/globals.css — loading styles only if route fallback needs globally available styling; confirm cascade first.
- apps/web/tests/arena/arena.spec.mjs — update behavioral contracts without weakening existing race and combat assertions.
- apps/web/tests/arena/visual-identity.spec.mjs and site-responsive.spec.mjs — scoped visual and route regressions.

Potential new files, only where boundaries warrant them:
- apps/web/src/app/arena/entry-flow.ts — discriminated union and pure legal transition function, no state-machine dependency.
- apps/web/src/app/arena/arena-entry.tsx — pre-duel presentation, keeping combat engine in place.
- apps/web/tests/arena/entry-flow.spec.mjs — focused browser coverage, using existing Playwright.

Re-use async-control.mjs cancellation rather than creating duplicate timer infrastructure. Verify how pure TypeScript tests run before selecting a new unit test file extension; current unit runner is Node against .mjs.

### State contract

Proposed states: preparing-arena, selecting-mode, searching, opponent-found, preparing-duel, entering-duel, ready, error.

- Events, not animations, own correctness.
- Selection does not start a queue.
- Start requires supported mode and valid current demo/session context.
- Cancel invalidates the current run; late callbacks cannot reveal an old opponent.
- Enter Duel is idempotent per accepted match/run.
- Essential readiness has a bounded timeout with retry/exit; decorative asset failure degrades gracefully.
- Unmount clears timers/listeners and aborts pending work where supported.
- Existing single opening-draw behavior remains authoritative; gate input, not game rules.
- Browser Back and direct /arena entry both work without dashboard context.
- Production test fixture parameters remain disabled.

### Small implementation steps

1. Record existing route links, CSS ownership and start/accept/cancel behavior.
2. Add a failing test for select-without-search, then implement explicit queue commitment.
3. Add cancellation and stale-callback regression before changing search effects.
4. Add a double-accept regression before adding preparation states.
5. Add readiness success/failure/retry tests before the branded loader.
6. Implement one approved state at a time; verify desktop and phone before the next.
7. Add reduced-motion and audio-failure coverage before cinematic polish.
8. Verify initial duel draw counts and first actionable state against unchanged rules.
9. Remove only obsolete pre-duel selectors after source and computed-style comparison.
10. Commit each coherent verified change to the corresponding planned PR; retain user edits and unrelated untracked files.

## Verification commands and acceptance

Run from apps/web using workspace pnpm:

```bash
pnpm test:arena
pnpm exec playwright test tests/arena/arena.spec.mjs
pnpm exec playwright test tests/arena/entry-flow.spec.mjs
pnpm exec playwright test
pnpm exec tsc --noEmit
pnpm lint
pnpm build
git diff --check
```

The new entry-flow target exists only after implementation. Check the current Node/pnpm versions and Playwright browser availability first. Existing Playwright config starts npm run dev; reconcile command ownership only if required, not as unrelated cleanup.

Required coverage:
- Cold navigation, warm/prefetched navigation, direct entry, browser Back.
- Select/change mode, explicit start, cancel near match-found boundary, rapid requeue.
- Double Enter Duel, unmount during preparation, failed image/font/audio, timeout and retry.
- No invisible input interception or input before ready; no duplicate opening draw.
- Keyboard-only full path, focus transfer, status announcements without per-second screen-reader spam.
- 44px minimum touch targets; normal text contrast at least 4.5:1; visible focus; 200% zoom; reduced motion.
- All checkpoint viewports: 360x800, 390x844, 430x932, 844x390, 820x1180, 1024x768, 1280x720, 1366x768, 1536x864, 1920x1080, 2560x1440, 3440x1440.
- Record transition timings under cold/warm cache and slow network; no forced wait once actionable content is ready.
- Human visual approval remains mandatory even with all automated checks green.

## Risks and release controls

- Scope can expand accidentally into real matchmaking: current deliverable is honest simulated entry UX, not networking.
- Art quality limits game identity: inventory licensed assets before promising new portraits or environments.
- CSS cascade can leak into battle layout: use scoped pre-duel selectors and keep existing placement tests.
- PR #7 is not merged but already represents production checkpoint: choose baseline deliberately, never reset to main and discard it.
- Preview before production. No merge/deploy merely to create a reviewable artifact. Revert only new entry commits if accepted implementation regresses; never destructive branch resets.

## Next decision

Approve M0-M2 and the documentation-only draft PR first. Review actual composition and motion prototype before authorizing the production UI implementation. Keep combat beyond initial entry out of scope.
