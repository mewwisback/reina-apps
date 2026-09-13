# REINA Product Specification

Status: approved product direction from user Q&A; not an implementation claim.
This consolidated document supersedes conflicting historical demo assumptions and earlier unanswered Q&A entries. Numerical economy and rating settings not stated below remain undecided.

## Product and Initial Scope

REINA is a Web3-themed TCG inspired by Yu-Gi-Oh!, centered on ranked competition, artwork appreciation, and relaxed sessions targeting approximately ten minutes. This is a duration target, not a forced match cutoff. Suitable retail-market launch timing is a business aspiration, not a guaranteed outcome. Referencing Yu-Gi-Oh! does not implicitly adopt every rule, card, or asset.

- Initial modes: Ranked (one duel) and Practice against a bot.
- Casual PvP, tournaments, and events are deferred.
- Three initial archetype playstyles: aggressive, defensive/control, Fusion/combo. All have access to Fusion. Names, lore, and card lists remain open.
- Ranked uses only owned cards. No shared competitive card pool is assumed.
- Many current pages and battle flows are placeholders. Revise UI alongside the functionality being delivered, not through another simultaneous whole-app redesign.

## Collections and Decks

- Main Deck: exactly 30 cards, maximum two copies of the same gameplay card.
- Extra Deck: zero to five Fusion Heroes, maximum two copies of the same gameplay card.
- Alternate artwork shares the gameplay identity and copy limit.
- Other cards remain in inventory. Editing permissions during active matches need specification; a duel must use an immutable validated snapshot.
- Existing 20-card saved decks require explicit migration/revalidation. Never silently pad, delete, or overwrite them.
- New players receive a free randomized but balanced, tribute-oriented valid starter deck. Include compatible Fusion material and a Fusion Spell within the 30-card total, plus one matching Fusion Hero in the Extra Deck.
- Starter generation recipes and balance guarantees require a reviewed card pool before implementation.
- Card categories: Hero, Spell, Trap. Existing Support cards require effect-by-effect mapping, not automatic deletion.
- Rarity: Common, Rare, Epic, Legendary; affects artwork and gameplay potential/complexity. Higher potential requires proportional conditions or costs; Common cards remain competitively useful.

## Duel Baseline

- Each player starts with 8,000 LP and five cards.
- Zero LP loses; both players reaching zero simultaneously produces a draw.
- Attempting a required draw from an empty deck loses. An empty deck alone does not.
- Server randomly selects the starting player with equal probability, independent of purchases or rank.
- Draw one each turn; starting player skips their first-turn draw and cannot attack that turn.
- Phases: Draw, Standby, Main Phase 1, Battle, Main Phase 2, End.
- Each player has five Hero slots and five Spell/Trap slots.
- One normal summon or set per turn; unused opportunity remains available in Main Phase 2.
- Level 1–4: no tribute; 5–6: one; 7+: two. Special summons follow explicit card conditions.
- Manual Attack/Defense position change: once per Hero per turn, not on its summon/set turn and not after attacking. Effects may override restrictions.
- One attack per Hero per turn unless an effect overrides. Newly summoned Heroes can attack except under first-turn or card restrictions.
- Direct attacks require an empty opposing Hero field unless an effect permits otherwise.
- Attack vs Attack: lower ATK is destroyed; controller takes the difference. Equal ATK destroys both under the agreed baseline; zero-ATK edge cases remain open.
- Attack vs Defense: higher ATK destroys defender without LP damage unless piercing applies; lower ATK damages attacker by the difference without destroying its Hero; equality destroys neither.
- Newly set Traps cannot activate that turn unless explicitly permitted.
- Eligible responses are manually selectable. Both players pass before a chain resolves last-in-first-out. Exact effect speeds, timing windows, targeting, negation, and mandatory-effect ordering remain open.

## Fusion

- Required in the initial release; Fusion Heroes come from the separate Extra Deck.
- Baseline: activate Fusion Spell, choose valid materials, summon matching Fusion Hero.
- Default materials: hand and field. Deck/graveyard materials require explicit effect permission.
- Materials normally go to graveyard unless the effect states another destination.
- Both named-Hero and category/archetype recipes are supported. Examples discussed in Q&A are not approved card definitions.
- Hero-effect Fusion without a Spell, negation behavior, full-field behavior, and exact resolution timing remain open.

## Timers and Terminal Outcomes

- Turn timer: 90 seconds. Expiry requests End Turn, not immediate defeat.
- Active timer pauses for opponent responses. Opponent has 15 seconds; optional-response timeout passes.
- Mandatory-choice timeout uses a documented deterministic legal choice, not strategic AI. Resolve pending chains before End Turn. Exact tie-breaking rules remain to be defined per action.
- Disconnect allowance: 60 seconds cumulatively per player per duel, not reset on reconnect. Still disconnected after allowance expires: loss.
- Verified server failure: no-contest with no rating change.
- Surrender is available during a duel, requires confirmation, and is a ranked loss.
- Simultaneous lethal is a draw. Draw rating treatment remains undecided.
- Server must own authoritative state, clocks, result resolution, and one-time rating application. Do not trust client ownership, LP, timers, or winner claims.

## Onboarding and Authentication

- Play requires no wallet connection. Authenticate through email or Twitter; providers and email method remain undecided.
- An in-world REINA character acts as AI assistant teaching how to play, not deck optimization or live ranked strategy. Specific character and AI runtime remain open.
- First session: receive starter deck, tour lobby, learn cards/Deck Builder, play guided practice duel.
- Tour introduces all menus/features with clear demo-like instructions; menu tour may be skipped.
- All tutorials are replayable; complete one guided practice duel before first ranked match.
- Quest rewards initially: account EXP and cosmetics, not cards or pack currency.

## Shop and Economy

- Additional cards come only from purchased gacha packs or later secondary NFT trading; no crafting or quest card rewards approved.
- Launch with one Core Pack containing multiple playable archetypes. Themed packs and rotations deferred.
- Pack: five cards, at least one Rare or higher. Rates and prices remain open.
- Show price, rarity probabilities, guarantees, and card pool before purchase.
- Purchases use internal currency, no wallet required. Top-up payment rails and currency names remain open.
- Duplicate conversion consumes selected cards after quantity/proceeds confirmation. Cards referenced by saved decks or locked for trading/NFT cannot be converted until properly released.
- Conversion yields separately tracked currency usable for packs. Paid and conversion balances remain distinguishable. No cash/crypto withdrawal for either balance initially.
- Conversion rates and other duplicate uses remain open.

## Deferred Web3 Scope

- Cards support secondary trading and import/export through smart-contract-based on-chain/off-chain integration. Chain, custody, lock/burn/mint semantics, and synchronization remain open; no universal implementation is assumed.
- Account NFT scope includes the entire account, but its design and delivery are explicitly last. Authentication credentials must not be conflated with transferable ownership.

## Delivery Order and Acceptance Gates

1. Duel rules, 30-card validation, Fusion: server rejects invalid sizes, duplicate/artwork bypasses, unowned cards, wrong zones; rule tests cover agreed turn/combat outcomes. Unsupported effects fail closed.
2. Starter/inventory/Deck Builder/tutorial: balanced recipe-based generation, atomic ownership changes, explicit legacy-deck recovery, replayable onboarding, ranked tutorial gate.
3. Ranked: authenticated matchmaking, authoritative action validation, reconnect clocks, deterministic results, idempotent result recording. MMR algorithm/tiers require separate approval.
4. Shop: disclosed rates, atomic currency/card updates, idempotent purchase settlement, duplicate conversion safeguards. No invented rates/prices.
5. NFT integration; account NFT last.

A stateless deck-validation endpoint is an initial backend slice, not authentication, ownership verification, persistence, matchmaking, or a production battle server. New services must expose their limits honestly. Frontend demo behavior remains separate until explicitly integrated.

## Remaining Decisions

Canonical card catalog and artwork identities; effect definitions and Fusion recipes; archetype balancing; zero-ATK and other edge cases; effect timing and mandatory-choice ordering; animation clock accounting; Side Deck; rating algorithm and seasons; API authentication, DB/deployment stack, anti-abuse; currency/payment/rates; Web3 details; lore and character identity.

## Dataset Handling

Use this document for approved requirements, not claims about shipped features. Preserve unanswered items as unknown. Keep hypothetical card examples labeled synthetic; derive examples only from approved rules. Version future changes through reviewed diffs and retain provenance to the Q&A record.
