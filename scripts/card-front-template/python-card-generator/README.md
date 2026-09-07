# Reina Python Card Generator

Offline, editable card generator. Python 3.9+ and Pillow only; no browser, Node, Figma, server, API key, or system fonts needed. Output: 750 x 1050 transparent-corner PNG, rendered at 2x then downsampled.

## Setup

Extract ZIP, open a terminal inside `python-card-generator`, then:

```sh
python -m venv .venv
# macOS / Linux:
source .venv/bin/activate
# Windows PowerShell instead:
# .venv\Scripts\Activate.ps1
python -m pip install Pillow
python generate_card.py --config examples/haku.json --output output/haku.png
```

On systems where Python is named `python3`, use that command to create the venv. Pillow is the only external dependency. Install requires network unless a Pillow wheel is available locally; generation works offline afterward.

## Make your card

1. Copy `examples/haku.json` to `examples/my-card.json`.
2. Put your JPG, PNG, or WebP artwork beside that JSON.
3. Edit JSON in any text editor. Change name, type, optional role, rarity, effect_title, effect, atk, def, and artwork.
4. Run `python generate_card.py --config examples/my-card.json --output output/my-card.png`.

Artwork paths are relative to the JSON file, NOT the terminal directory. Absolute local paths also work. Use forward slashes in JSON paths. Output paths are relative to the terminal directory. Existing output PNGs are replaced atomically after successful rendering. Input artwork, config, fonts, and frame assets cannot be output targets.

```json
{
  "name": "HAKU",
  "type": "HERO",
  "role": "SCOUT",
  "rarity": "ELITE",
  "effect_title": "ROSTER PROFILE",
  "effect": "Finds the signal inside the noise.",
  "atk": 70,
  "def": 88,
  "artwork": "haku.jpg",
  "crop_focus": [0.57, 0.21]
}
```

**Review status: PROPOSED visual roster metadata, NOT approved combat balance.** `roster-manifest.json` pins canonical source, exact field mappings and original artwork hashes. All five roles, rarities, ATK/DEF and profile sentences come verbatim from `reina-fe/src/lib/roster.ts` at `2c4c49d3c81e0554daad052b6d8d42cdc08ff73d`. No numerical values needed invention. `ROSTER PROFILE` replaces the effect heading: these sentences are flavor/profile copy, never executable abilities. Crown ornament stays decorative.

| Hero | Role | Rarity | ATK | DEF |
| --- | --- | --- | ---: | ---: |
| HAKU | SCOUT | ELITE | 70 | 88 |
| REI | BLADE | LEGENDARY | 98 | 95 |
| SORA | STRATEGIST | RARE | 75 | 70 |
| KOMA | VANGUARD | ELITE | 65 | 95 |
| YUI | CLERIC | COMMON | 45 | 80 |

Canonical REI has an Overdrive sentence (free fusion once per match), but the actual arena has no such implemented hero ability. Arena `rei` is REI ZERO, EPIC, 2200/1200. This is an unresolved identity/rules conflict, NOT a verified alias. Haku, Sora, Koma and Yui have no arena entries. All manifest `combat_id` fields remain null. Never feed these display stats into arena rules or silently scale them.

Revision 2 moves the footer up 5px without changing frame or artwork. Regression measures actual REINA glyph bounds against y=1001..1014, inside the y=1018 inner frame with an inset. All five PNGs are regenerated. `output/contact-sheet.png` collects them; `assets/card-back-approved.jpg` preserves the separately approved back unchanged. Previous ZIPs outside this directory are preserved; new `reina-python-card-generator-r2.zip` is a runnable package, not only images.

## Crop and text behavior

- `crop_focus` is optional `[x, y]` in normalized, EXIF-oriented image coordinates, each 0..1. Defaults to center `[0.5, 0.5]`. Selected point is centered when possible, clamped at image edges.
- Haku uses face focus `[0.57, 0.21]`. Head remains fully visible. Near-square 666 x 564 artwork window necessarily trims lower torso/blade from tall portrait. Move y downward to show more blade, at cost of headroom. No stretching or automatic face detection.
- Effects wrap at word boundaries, preserve explicit `\n` paragraph breaks, and shrink from 20px to minimum 16px. About 3 short lines fit. Overflow or a word too wide is rejected, never silently truncated. Headers and other fields also shrink to fixed minimum sizes, then fail.
- Stats must be JSON integers 0..999999 (not strings, floats, or booleans). Unknown keys, invalid focus, missing files, malformed JSON, and empty required fields produce `Error:` and exit code 2. Role may be omitted or empty.
- Bundled DejaVu Sans fonts cover Latin and many European scripts; no CJK/emoji guarantee. Text is plain, without rich markup. No GUI, batch interface, print bleed, CMYK, or variable layout.

## Test

```sh
python -m unittest -v test_generate_card.py
```

Tests render real images, compare every editable field, change artwork, and reject negative stats, invalid values, overflow, and non-PNG output.

## Assets

`assets/frame-clean.svg` is approved original frame with EVERY SVG text element removed. `assets/frame-clean.png` is its reusable transparent 2x raster, generated once with Chromium. Runtime reads PNG only. No original sample name, effect, or stats are baked in. Original source template outside this package is preserved. Generator composes user artwork and new labels using Pillow. Bundled fonts include their redistribution license in `fonts/LICENSE-DejaVu.txt`. Artwork is user-supplied; no additional artwork rights are granted by this package.
