# Dashboard Deck Play Space — draft implementation contract

## Scope and dependency

Asset finalization and implementation preparation only. No production dashboard, combat, route, dependency, merge or deployment changes in this PR. Stack on `fix/arena-combat-lifecycle` while PR #9 remains OPEN (head `639c035de13acd12beb2062fac32449671471b5d`). Do not merge #9 as part of this work. After its independent merge, rebase this branch onto current main and retarget this draft before review.

## Source authority and accepted composition

1. User-approved concept 3 navigation revision: local `scripts/dashboard-concepts/deck-play-space.html`, `screenshots/deck-play-space-navigation-desktop.png` and `screenshots/deck-play-space-navigation-mobile.png`. These historical untracked review files stay untouched; this contract carries their selected direction into GitHub. They are not a working production implementation.
2. Canonical `reina-fe` commit `2c4c49d3c81e0554daad052b6d8d42cdc08ff73d`: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/site-nav.tsx`, `src/lib/roster.ts`.
3. Existing target route behavior and arena rules remain authoritative for function, not marketing roster metadata.

Keep cream `#f5f1e8` play table, dark `#0d0b10` deck-only rail, crimson `#e03c4e` action, gold `#e8b45c` focus, and ink `#ede7dc`. Heavy Zen Kaku Gothic New for gameplay hierarchy, Zen Old Mincho for wordmark, JetBrains Mono for metadata. Desktop navigation has physical layout footprint: approved prototype uses 88px primary header plus 64px secondary bar. Mobile uses 68px header, 48px context bar, and reserved bottom navigation at least 76px plus safe-area inset. Keep readable secondary text and scroll on short screens; do not shrink a desktop canvas to phone size.

## Route inventory and reachability

All eight destinations exist at `apps/web/src/app/<route>/page.tsx`.

| Label | Actual route | Desktop | Mobile |
| --- | --- | --- | --- |
| Home | `/dashboard` | Primary, `aria-current=page` on dashboard | Labeled bottom tab |
| Collection | `/collection` | Primary | Labeled bottom tab |
| Deck Builder | `/deck-builder` | Primary | Labeled bottom tab |
| Shop | `/shop` | Primary | Labeled bottom tab |
| Quests | `/quests` | Visible secondary | More disclosure |
| Leaderboard | `/leaderboard` | Visible secondary | More disclosure |
| Docs | `/docs` | Visible secondary | More disclosure |
| Wiki | `/wiki` | Visible secondary | More disclosure |

PLAY enters `/arena` category selection; it does not start a duel directly. Existing arena owns category/search/found/duel. Profile and Settings are separate top-right controls: no matching route currently exists, so do not ship dead links or invent account persistence. Scope their real panel behavior in a later stage. More must expose `aria-expanded`/`aria-controls`, keyboard focus, Escape/outside dismissal and restore focus without covering PLAY. Navigation must use actual links, not prototype modal previews.

## Data boundaries and unresolved mappings

`../scripts/card-front-template/python-card-generator/roster-manifest.json` records exact source lines, source hash, five configurations and artwork hashes. All five stats already exist in canonical roster; no values were invented. This is PROPOSED visual roster metadata, not approved arena balance. ROSTER PROFILE displays the source `desc`, never a functional effect.

- HAKU SCOUT ELITE 70/88; SORA STRATEGIST RARE 75/70; KOMA VANGUARD ELITE 65/95; YUI CLERIC COMMON 45/80. No corresponding arena hero records exist.
- REI BLADE LEGENDARY 98/95 versus arena `rei`, REI ZERO, EPIC 2200/1200. Similar name/id does not establish equivalence. Canonical Overdrive ability is not implemented by arena and is intentionally absent from cards.
- Arena also has CHISE BLADE 1750/1100, YURI SCOUT 1100/900, TARI GUARD 900/1700 and MIRA VEIL 1350/1400. Do not alias them to canonical heroes by role.
- Deck Builder currently generates synthetic `h0..h99` names and uses local component state. Arena constructs two copies of its own ten-card base pool and does not consume selected Deck Builder data. Dashboard selection must not claim connected inventory or change actual arena deck until a separately reviewed identity/persistence contract exists.
- Arena rules inspected: `page.tsx` base pool, stage/summon/tribute rules; `rules.mjs` battle/trap/spell outcomes. Starting LP 4000; opening 1 hero slot/1400 ATK cap, escalation 3 slots/1800 cap, reign 5 slots; tribute thresholds 1400/2000; one summon/set/spell allowance. None changed. Display roster values are not compatible combat inputs.

## Proposed state flow (not implemented)

| State/event | Required result |
| --- | --- |
| Loading deck source | Stable layout, honest loading status; no invented count/rank/currency |
| Empty/error source | Explain state, retry or Deck Builder link; no fake owned heroes |
| Select deck | Set selected deck identity; resolve its visual hero ids; synchronize rail name, center card, captions and accessible name in one update |
| Select hero | Center actual matching rendered hero PNG; retain fan hierarchy and keyboard selection; show its profile in readable inspection view |
| Image loading/failure | Approved back while loading; explicit error/retry on failure, never unrelated frame animation |
| Rapid reselection | Cancel previous GSAP timeline; latest selection wins; no stale hero under new label |
| PLAY focus/press | Native button with clear focus, depressed depth, pointer/touch/Enter/Space parity; guard duplicate activation |
| PLAY accepted | Short one-shot entry feedback, then `/arena` category page once; do not promise selected deck is used by current arena |
| Back/navigation failure | Restore interactive state and selection; cancel pending timeline/navigation side effects |
| Unmount/hidden/reduced motion | Revert GSAP context, stop work while hidden, skip motion under live reduced-motion preference |

GSAP is already installed (`^3.13.0`). Use it for selected-card settle/flip and PLAY entry only, not endless floating or old `frame-032/120/239.webp` sequences. Preserve actual card ratio 750:1050 with `object-fit:contain`; no added overlays covering card labels, no redesigned art. Proposed timings: selection 180–300ms, press 80–120ms, entry at most 350ms; review in rendered samples before calling them approved. Under reduced motion, state change and navigation remain immediate and fully functional. Sound optional and user-controlled; no autoplay requirement.

## Assets and provenance

Generator root: `scripts/card-front-template/python-card-generator/`. Five unchanged originals in `examples/{haku,rei,sora,koma,yui}.jpg`; editable matching JSONs; regenerated fronts `output/{hero}.png`, 750x1050 RGBA; `output/contact-sheet.png` for review. Approved front frame retained in `assets/frame-clean.{svg,png}`. Only footer text position moves up 5px; all artwork and crop focus retained.

User input filenames, in roster order Haku/Rei/Sora/Koma/Yui: `img_359521e12cdd.jpg`, `img_baf6585f87fb.jpg`, `img_0d60ed1afba9.jpg`, `img_e515299b90ed.jpg`, `img_a797cca77c90.jpg`. Approved back `img_ffe274ff6601.jpg` is copied unchanged to `assets/card-back-approved.jpg`. No new artwork rights granted. Font redistribution license bundled. New local runnable archive `scripts/card-front-template/reina-python-card-generator-r2.zip` preserves earlier ZIPs; archives, caches, unrelated prototypes, root `index.js` and `artifacts/` are excluded from commit.

## Acceptance gates and next stages

1. **Asset review (this draft):** inspect all five at native size; hashes prove original art/back/frame preservation; tests prove footer measured glyph bounds inside inset y=1001..1014. Confirm roster metadata wording and unresolved combat identity before production use. Visual approval remains user's decision.
2. **Dashboard-only implementation (next):** write failing browser regressions first; implement eight route links, selected hero/card synchronization and honest local selection boundaries; add GSAP card/PLAY feedback. No combat rewrite or fabricated connected deck state. Resolve Profile/Settings behavior explicitly.
3. **Browser acceptance:** desktop 1600x900, tablet 1024x768, touch/mobile-UA 390x844, 320x740, landscape 844x390. Assert loaded fonts, critical label containment within clipping parent, image success, navigation current state, focus order/restoration, More dismissal, unobstructed 44px targets, safe-area footprint, rapid selection, double PLAY, route back, live reduced motion and unmount cleanup. Inspect screenshots at actual size and record card/PLAY motion; emulation is not physical-device verification.
4. **Integration review (separate approval):** define shared hero IDs, deck ownership/persistence and validation before wiring dashboard decks into arena. Resolve REI/REI ZERO, rarity scale, stats and Overdrive conflict explicitly; never derive combat changes from these PNGs.
5. **Release gate (not authorized now):** run arena unit/e2e regression, lint, sequential build/type check; compare dashboard route bundle before/after, review scoped diff, obtain independent review and user visual acceptance. Retarget after #9 merges independently. Merge/deploy only on later explicit authorization.

## Verification record

Baseline generator: 5 tests passed. Footer regression observed RED (`1017.0 not less than or equal to 1014`), then GREEN after 5px move; suite now includes this regression. Runtime Pillow 12.3.0, existing Python 3.11.15; no packages installed. Static asset/source checks and extracted archive test results are reported in PR. Production build and browser dashboard motion tests are deliberately deferred: no production dashboard implementation exists in this change. Independent reviewer tool unavailable in this run; no independent approval claimed.
