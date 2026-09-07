# Arena desktop-fit phone correction

## Reproduction

User Android Brave/custom-tab capture contains SELECT MODE, a tiny desktop header, side-by-side deck, three horizontal modes and excessive hero height. Existing viewport metadata is correct: `width=device-width, initial-scale=1`.

Regression uses a 390px touch screen with a separate 980px or 1200px layout viewport and proportional height. Before correction, both tests fail: consecutive mode rows share the same y coordinate. This reproduces the screenshot's composition; it does not prove which browser setting caused the user's device to choose that viewport.

## Correction

Entry only: coarse-pointer portrait devices with screen width <=600px reuse mobile reflow regardless of layout viewport width. When layout width exceeds screen width by 25%, native CSS zoom compensates browser desktop-fit shrink, and entry height divides by the same factor. Resize recomputes density. No UA sniffing, viewport metadata mutation, zoom ceiling or visualViewport-scale compensation. Pinch zoom remains user-owned. Combat, crimson identity and native H.264 backdrop stay unchanged.

`npx playwright test desktop-fit-phone --project=functional --workers=1` checks separate screen/layout dimensions, vertical modes, physical touch-target heights, reachable CTA, pinch zoom and six-card duel entry. Existing mobile game matrix covers 320–3440px, tablet and landscape. Browser emulation is not physical Brave verification.
