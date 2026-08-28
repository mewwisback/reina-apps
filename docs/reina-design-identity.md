# Reina Design Identity

## Core identity

Reina is an anime card-battle world built from restraint, ritual, and controlled violence. Interfaces should feel like part of a match: dark stone, quiet courtyards, crimson signals, warm metal, sharp silhouettes, and brief bursts of motion.

## Source baseline

This guide consolidates recurring choices from `reina-fe` and `reina`:

- Near-black aubergine surfaces with crimson, bone, copper, and muted gold accents.
- Display serif for names and decisive headings; monospace for match telemetry; readable sans-serif for explanations.
- Full-bleed character or environment art under strong contrast overlays.
- Thin rules, clipped corners, offset borders, and deliberate asymmetry instead of rounded dashboard cards.
- Short labels, concrete stakes, and character-aware copy instead of generic product language.

## Layout rules

- Put current decision or battle state first. Supporting lore follows.
- Use one dominant focal point per state: mode selection, opponent reveal, active card, or result.
- Keep persistent match telemetry at edges: region, latency, turn, phase, LP, deck count.
- Use rectangular or clipped game surfaces. Avoid floating rounded cards, pill clusters, glassmorphism, and equal-weight feature grids.
- Desktop may be asymmetric. Mobile must collapse to one readable decision column.

## Motion and effects

- Motion communicates state: searching, found, accepted, draw, summon, damage, trap, lethal, result.
- Prefer CSS transforms and opacity. Keep queue motion ambient; keep combat impact under 400 ms.
- Support `prefers-reduced-motion`; never hide required information inside animation.
- Use screen shake only for high-impact damage and keep it local to the battle field.
- Particles, flashes, and overlays must preserve card text and controls.

## Sound

- Sound is event-driven, short, and optional: select, queue start, opponent found, accept, draw, summon, attack, damage, result.
- Never autoplay background music. Start audio only after user interaction.
- Provide a persistent mute control. Failed playback must not block gameplay.
- Store license text beside third-party audio assets.

## Copy

- Name game objects and consequences: `Enter queue`, `Rank at stake`, `Deck valid`, `Duelist found`.
- Avoid generic copy such as `Get started`, `Discover`, `Unlock`, or `Experience the future`.
- Use Reina character and world names only when their role is clear.
- Queue counts and wait ranges must be labeled as live or estimated.

## Delivery priorities

- **P0:** readable state, explicit actions, keyboard focus, reduced motion, mute control, deterministic gameplay tests.
- **P1:** mode-specific matchmaking, opponent reveal, battle impact cues, responsive layouts, licensed sound set.
- **P2:** character-specific transitions, event themes, richer particles, spatial audio, optional animated environment assets.

## Boundaries

- **NEVER** copy unlicensed Pinterest or social-media assets into production. Use them only as references.
- **NEVER** let effects delay, obscure, or mutate gameplay resolution.
- **ALWAYS** preserve deterministic Arena rules and automated regression coverage.
- **ALWAYS** verify production build before deployment.
- **IMPORTANT:** Visual acceptance belongs to the product owner; automated review covers function, hierarchy, accessibility, and rendering defects.
