# Arena Correctness and Delivery Roadmap

Baseline: `main` at `0f813291`. Existing deterministic rules cover spell damage, tribute selection and downgrade prevention, winner priority, stance comparison, trap arming, and trap-first direct attacks. Browser coverage and centralized runtime resolution are absent.

Severity measures player-impact risk. Priority controls execution order.

## P0: Gameplay Correctness

| Severity | Work item | Acceptance criteria | Depends on |
| --- | --- | --- | --- |
| Critical | Centralize lethal resolution | Direct attacks, combat damage, reflected damage, and player/bot spells clamp LP to zero, resolve exactly one winner, and prevent every queued turn/state transition after lethal. | None |
| Critical | Complete deck-out runtime flow | Final draw and empty deck resolve once for both sides; result dialog identifies winner; bot sequence stops; rematch resets deck-out state. Covered end-to-end. | Central result resolver |
| High | Define equal battle outcomes | Owner confirms proposed rule: ATK vs ATK tie destroys both; ATK vs DEF tie destroys neither. Pure rules and runtime match the decision. | Owner decision |
| High | Add permanent browser regression | Repository-owned Playwright coverage exercises matchmaking, draw, summon, one/two-card tribute, deselect/cancel, battle, trap, lethal, deck-out, result dialog, and rematch. | Lethal and equal rules |
| High | Audit async state races | Stress repeated summon, trap reflection, result, rematch, and bot timing. No stale attacker, duplicate result, or post-result mutation. Pending timers are cancellable. | Central resolver; browser harness |

## P1: Strategy, Rules, and Interaction

| Severity | Work item | Acceptance criteria | Depends on |
| --- | --- | --- | --- |
| High | Strategic bot target selection | Bot evaluates direct lethal, reflected-damage risk, survivability, and target value; deterministic tests cover choices. | Stable battle/trap resolver |
| High | Player tribute runtime UX | Two-HERO tribute, deselect, cancel, rematch, and full-board paths preserve cards and provide clear messages. | Browser harness |
| Medium | Distinct spell identities | CRIMSON SURGE, QUEEN’S EDGE, and LAST PULSE have documented, deterministic effects rather than name-based generic damage only. | Card design decision |
| Medium | Trap activation choice | With multiple armed traps, player may select one or decline; bot behavior is deterministic; only the resolved trap moves to grave. | Support resolver |
| Medium | Support ordering and chain resolution | Multiple valid support effects use documented priority, cannot resolve twice, and transition to grave in order. | State-machine design |
| Medium | Complete card text | Inspect UI states tribute cost, timing, effect, target, and restrictions for every card. | Final card rules |
| Medium | Mobile interaction audit | Small viewports support hand scrolling, tribute and target selection, result dialog, and matchmaking without clipping or blocked controls. | Browser harness |

## P2: Presentation, Accessibility, and Operations

| Severity | Work item | Acceptance criteria | Depends on |
| --- | --- | --- | --- |
| Medium | Matchmaking interaction audit | Repeated Find Another, cancel, and Enter Duel produce no layout shift, duplicate timer, or stale match. | Browser harness |
| Medium | Accessibility audit | Keyboard-only flow works; transitions restore logical focus; result dialog traps and restores focus; labels and contrast pass automated checks. | Stable interaction flow |
| Low | Strong duel feedback | Tribute candidates, destroyed cards, trap triggers, damage sources, and invalid actions have distinct visual and text feedback. | Final resolution events |
| High | Split Arena page and introduce reducer/state machine | Extract pure resolution and bot-turn orchestration from `page.tsx`; one event owns each transition; behavior remains covered. | Regression suite |
| High | Add repository-root Vercel deploy guard | One `deploy:prod` command verifies repository root and expected `reina-apps` project before production deployment; mismatch fails before deploy. | Confirm Vercel project identity |

## Execution Sequence

1. Central lethal/result resolver and terminal-state cancellation.
2. Owner decision and implementation for equal battle outcomes.
3. Permanent Playwright regression, including deck-out and rematch.
4. Async race audit and reducer/state-machine extraction.
5. Bot targeting, tribute UX, and support/chain semantics.
6. Card identities and complete card text.
7. Mobile, matchmaking, feedback, and accessibility audits.
8. Repository-root Vercel deployment guard.

## Definition of Done

- Pure rule tests, browser regression, build, and lint pass.
- Every terminal outcome stops subsequent state mutations.
- New decisions are documented beside tests.
- Mobile and keyboard paths remain usable.
- Production deployment cannot target an unintended Vercel project.
