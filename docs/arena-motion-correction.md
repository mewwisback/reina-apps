# Arena motion correction

Canonical authority: read-only `reina-fe/src/lib/card-flip-frames.ts` and `src/components/hero-card-backdrop.tsx`; 240 original 1280×720 WebP frames, 24fps ping-pong. All 240 files copied byte-for-byte (29,549,052 bytes). Reference eager decoded cache intentionally replaced by eight-frame lookahead, two in-flight fetches, explicit ImageBitmap.close(), abort/cleanup on visibility, preference changes and unmount. Final-frame card-field.webp remains static reduced-motion/error fallback. No gameplay changes or extra wait.

Global GSAP hero/stagger reveals removed, not disguised with moving static image. Ruleset underline only touches selected control. Search uses one border-color settle; opponent uses one short lateral arrival; existing board-entry effect remains scoped to screen/duel run, never card or phase updates. All effects retain reduced-motion handling and cancellation cleanup.

## Verification

- RED: three new browser tests failed on missing canvas, repeated hero transforms, missing live preference playback.
- GREEN: 258 browser tests passed (4.0m), 28 unit tests passed; TypeScript, lint and production build passed. Four existing lint warnings and multiple-lockfile build warning remain. Arena route 11.1 kB / first-load 144 kB (previous 10.5 kB / 144 kB).
- Runtime tests compare three distinct canvas pixel data snapshots; verify fewer than 100 initial sequence requests, maximum 10 live bitmaps including concurrent decode, hidden-tab pause/release/resume, unmount release, live reduced-motion no-fetch/static state, heading stability through selection/search/cancel/found, opponent no-replay on sound update, board no-replay on phase update.
- Capture script `apps/web/tests/capture-entry-motion.mjs`: desktop/phone three hashed canvas PNGs, full screenshots and WebM, search/found/duel screenshots, six-card hand, zero overflow and zero page errors. It also checks no sequence requests after duel unmount.
- Local evidence: `artifacts/arena-motion-correction/`; distinct SHA256 hashes and exact request counts in evidence.json. Screenshots inspected: desktop lobby frame 0/2, phone found. No foreground clipping; intended canonical design preserved. Visual acceptance remains owner's judgment.
- Reproduce production evidence: `ENTRY_BASE_URL=https://reina-apps.vercel.app ENTRY_CAPTURE_DIR=/tmp/reina-motion-production node tests/capture-entry-motion.mjs` from apps/web.

No independent reviewer tool available in this delegated session; independent approval not claimed. No new dependency. Existing untracked artifacts and root index.js preserved. Matchmaking remains explicitly simulated. No merge.
