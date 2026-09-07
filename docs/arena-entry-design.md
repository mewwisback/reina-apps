# Arena entry — canonical source correction

## Authority and correction

`reina-fe` is visual authority. Previous Courtyard Threshold implementation was rejected by owner. Previous “0/10 structural tells” and approval claims were unsupported and are withdrawn. This revision does not claim subjective acceptance.

| Source | Applied evidence |
|---|---|
| `src/lib/tokens.ts`, `src/app/globals.css` | Void `#0D0B10`, ink `#EDE7DC`, cream `#F5F1E8`, crimson `#E03C4E`; gutter `clamp(20px,4.5vw,56px)` |
| `src/app/layout.tsx` | Zen Kaku sans content/display, Zen Old Mincho wordmark, JetBrains Mono metadata; target retains existing vendored Next local fonts |
| `src/components/site-nav.tsx` | Centered REINA identity, crimson clipped R mark, separate leave/sound controls |
| `src/components/hero-section.tsx` | Large heavy sans statement, crimson signal bar, dark card field, clipped crimson action |
| `src/components/roster-section.tsx`, `packs-section.tsx` | Open space, short section labels, strong heading hierarchy; not equal-weight decorative card furniture |
| `src/hooks/use-hero-intro.ts`, `reveal-heading.tsx` | GSAP line reveals, staggered rise, expo easing, scoped cleanup |
| `public/assets/card-flip/frame-239.webp` | Byte-for-byte copied to `public/arena/card-field.webp`; decorative only |

## Structure

Remove invented brown court, serif headline, decorative CSS deck stack, numbered vertical option cards. Replace with wide card-field hero, deck facts at opposite edge, unboxed horizontal ruleset strip on desktop, compact rows on phone. Search and opponent reveal occupy same ruleset region. Existing explicit selection/start, cancel, accept, sound preference, dashboard departure and combat remain intact.

## Motion and access

GSAP reveals headline lines, eases card-field scale, staggers supporting content and rulesets, draws selected underline, and wipes opponent name after VS arrival. No ambient loop. Hover and focus share state styling. Reduced motion skips GSAP. Found state focuses accept. Native button pressed/disabled semantics remain. All controls stay in document flow; phone may scroll.

## Evidence and limits

New browser regression observed red before structural implementation. Font check targets actual primary family, not platform-dependent Next fallback family. Separate text-range containment test found headline font metrics outside clip parent; padding fixed all four failing sizes (320, 390, 844, 1280). Full existing combat suite remains required.

Desktop and phone screenshot/video capture exercises dashboard, selection, search, found and six-card duel. Initial screenshot audit noted Next development badge over footer; production verification must confirm absence. Initial disabled CTA is intentionally muted until selection, not live-action contrast. Browser computed mode heading text-shadow and filter are both `none`; alleged chromatic fringing was not a CSS effect. No fabricated live players, rankings, rewards, queue estimate or deck validation.

Canonical card art is one static 1280×720 frame with short GSAP entrance, not 240-frame playback; avoids downloading entire 30 MB sequence for decorative entry. Visual judgment remains owner’s. Existing untracked artifacts and root `index.js` preserved. Rollback by reverting scoped correction commit, no combat reset or base-branch merge.
