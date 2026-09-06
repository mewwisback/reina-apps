# Courtyard Threshold

## Approved direction

Operate surface. Courtyard Threshold selected by owner; alternative visual approval waits waived. Compact ruleset rail and close tabletop variants rejected: first gives deck too little presence, second cannot retain opposite seats on narrow screens without hiding controls.

Existing ritual-chamber environment reused; CSS physical deck uses Reina mark rather than introducing licensed character art. No proprietary game screen or asset copied. External game-reference audit from original plan was not completed; composition derives from existing Reina assets and tokens.

## Motion storyboard

| State | Anticipation / action / settle | Interruption | Reduced motion |
|---|---|---|---|
| Dashboard departure | Shell recedes, threshold status rises; native Link navigates immediately | Scoped cleanup on unmount | Immediate navigation |
| Lobby | Rule draws across; mode rail arrives in short offset beats | Context reverts when state changes | Static readable layout |
| Selection | Chosen mode presses inward; deck rotates back into square | Selection context replaces prior movement | Pressed marker and background only |
| Search | Deck lifts slightly; connecting line contracts asynchronously | Hidden tab pauses loop; cancel clears timer and reverts GSAP | Elapsed text only |
| Found | Opposing seat arrives; VS accent lands; name settles separately | Cancel exits; readable text never waits on opacity | Immediate identity |
| Duel | Board opens; opposing HUD rails move inward; command rail settles | Timeline never initializes combat; unmount reverts | Immediate readiness |

Existing 4.2-second simulated search retained, labeled honestly. No network claims, ETA, live counts, MMR, opponent win record or deck-validity assertion. Ranked and Event are explicitly demo rulesets with standard combat, no rewards/rank service.

## Correctness boundary

Combat initialization has synchronous idempotency guard. Existing opening five-card deal and authoritative turn-one draw produce six cards. Rematch resets guard. Combat rules and AI scheduler otherwise unchanged. Entry inert gate lasts at most 400 ms (zero under reduced motion); independent cancellable timer controls readiness, not GSAP completion. First command receives focus.

All essential battlefield controls, marks, and cards are DOM/CSS/canvas; no external image is essential for play. Environment image is decorative and can fail without blocking entry. Therefore no fabricated asset handshake, percentage, or loading stages. Route fallback reflects actual Next route loading only.

## Verification notes

Initial visual audit: desktop title/rail hierarchy coherent, phone reveal contained. Disabled start button intentionally muted before selection. Focus and pressed state exposed semantically. Decorative background remains subordinate. Opponent arrival initially crossed viewport edge at 1280px; reduced travel from 90px to 16px after real failing browser containment assertion.

Slop audit: 0/10 structural tells. Serif and Japanese type families inherited, no SaaS feature tiles, fake metrics, floating glass, icon toppers or generic gradient palette. Card stack is CSS card furniture, not invented character illustration.

## Release and rollback

Base: `redesign/arena-game-ui` at `e7cf6d4` (PR #7). Entry PR #8 remains scoped against that branch. Revert implementation commit(s), not checkpoint or unrelated open PRs, for rollback. Production should only move after regression gates pass. Existing untracked artifacts and root index.js remain preserved.
