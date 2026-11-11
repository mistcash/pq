# Hyperframes Composition Brief: pq

## Objective
Create a short launch-style brag video for pq.

## Output
- Composition directory: `brag-output-2026-11-11-070453/composition/`
- Rendered video: `brag-output-2026-11-11-070453/brag.mp4`
- Format: landscape — 1920x1080, 30 fps
- Duration: 23 s

## Source Material
- Project root: the repo root (`mistcash/pq`)
- Primary files read: `README.md`, `DESIGN.md`, `GLOSSARY.md`, `packages/nextjs/app/page.tsx`, `app/layout.tsx`, `styles/globals.css`, `app/_components/{Landing,Register,People,Chat,Messages,Restore}.tsx`, `components/{Header,Avatar,Confetti,DeepDive,TxLink}.tsx`, `public/logo.svg`, `public/thumbnail.jpg`
- Product name: pq
- Tagline / strongest claim: "Scalable, post-quantum cryptographic messaging for private payments and peer coordination."
- Key UI or visual moment to recreate: the Chat screen's Say hi → "Doing some secret math, right here in your browser…" → "You're connected!" with confetti; the Landing's dashed Public card and hand-off row; the creature avatars
- Copy that must appear verbatim (the first two lines are the user's own framing, grounded in the README's "Messages encrypted to today's elliptic-curve keys can be harvested now and decrypted once a large quantum computer exists"):
  - Private payment viewing keys aren't post-quantum secure.
  - One day, every auditor commitment becomes public.
  - Private payment / made in your payments app / from ? to ?
  - Scalable, post-quantum cryptographic messaging for private payments and peer coordination.
  - Only they can read what you write.
  - Say hi 👋
  - Doing some secret math, right here in your browser…
  - You're connected!
  - They'll find your chat when they tap “Find my chats”.
  - 🔒 Post-quantum · 🌍 On Ethereum · 🙈 The chain can't see who's talking
  - Private now, and for years to come. / today · in 10 years · in 20 years
  - Kyber512 · zero-knowledge proofs · Poseidon2
  - Your turn: say hi.
  - GitHub mistcash/pq · MIST.cash private payments

## Creative Direction
- Tone preset: default
- Creative direction: a playful, polished launch built from the app's own cards, creatures and confetti
- Interpretation: 7 short scenes on a 120 BPM grid, all on light grounds; springy pops for arrivals, blur swaps and wipes between beats, readable holds
- Angle: today's private payments have a quantum expiry date. Their ECDH viewing keys aren't post-quantum, so auditor commitments go public one day; pq hands keys over with Kyber512 instead, and the ending's locks answer the opening's broken one.
- Hook: "Private payment viewing keys aren't post-quantum secure." on light blue, with a lock that springs open for a quantum computer
- Outro / punchline: "Your turn: say hi." with the CTA tapped on the strong cue
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Claims the project never makes (no "unbreakable", no numbers beyond the README's)

## Visual Identity
- Background: `#E3EDF5` / `#FFFFFF`
- Text: `#081019`
- Accent: `#0052FF`; `#FF8863` for what quantum computers break; confetti `#FFCF72`
- Display font: Fredoka 700 (shipped as `assets/fonts/fredoka-*.ttf` with `@font-face`)
- Body font: Fredoka 400/500
- Visual references from the project: DaisyUI 5 card/btn/chat/input with the app's light theme; Tailwind v4 classes copied from the JSX; keccak creature avatars (ported to `assets/avatar.js`); the app's `pop` curve `cubic-bezier(0.3, 1.6, 0.6, 1)` and confetti burst `cubic-bezier(0.1, 0.8, 0.3, 1)`; `public/logo.svg`

## Storyboard
Use the storyboard in `brag-output-2026-11-11-070453/brag-plan.md` as the creative contract.

Scene summary:
1. Keys — 3.0 s — "Private payment viewing keys aren't post-quantum secure."; today's lock closed, the quantum computer's lock opening
2. Leak — 3.0 s — "One day, every auditor commitment becomes public."; the private-payment card decrypting, both parties revealed
3. Title — 3.5 s — logo tile + verbatim tagline + three perks
4. Say hi — 4.5 s — app frame, tap, secret math, "You're connected!"
5. Send — 3.0 s — composer types, send, bubble; "🙈 The chain can't see who's talking."
6. Lasting — 3.0 s — "Private now, and for years to come." + three locks that stay closed
7. Your turn — 3.0 s — logo, "Your turn: say hi.", CTA tap, pills

## Audio
- Audio role: warm bed with motion-matched UI accents
- Audio arc: bright from the first frame, fades under the end card
- Music: `assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`
- Music treatment: volume 0.38; 0.7 s fade-out; final mix mastered to about −16 LUFS
- Music cue guidance: bundled preset `.claude/skills/brag/assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json`; beats at 0.02 + 0.5·k; strong cues 17.02 / 17.52 / 18.02 (Lasting's locks) and 21.01 (the CTA tap) locked
- Audio-reactive treatment: subtle; bass breathes the Lasting locks' glow
- Audio-coupled moments:
  - 0.54 / 1.54 — the first lock latching, the second springing open
  - 3.54 — soft impact on the decrypt
  - 6.02 — warm accent on the logo
  - 10.02, 15.52, 21.04 — cursor clicks
  - 13.02 — success bell with the confetti
  - 14.35–15.07 — a few key ticks
  - 17.04 / 17.54 / 18.04 — Lasting's lock latches
  - 21.06 — final bell with the CTA confetti
- SFX selection guidance: low high-frequency-risk Kenney files (`interface/click_00x`, `impact/impactSoft_medium_001`, `interface/switch_00x`, `impact/impactBell_heavy_00x`, `keyboard/keypress-*`), rotate takes for repeats, SFX at 0.55–0.85 with repeats quieter
- SFX analysis guidance: `.claude/skills/brag/assets/sfx/sfx-analysis.md`
- Exact SFX choice: chosen against the implemented animation
- Audio files: copied into `composition/assets/`

## Hyperframes Instructions
Composition contract per the `hyperframes` skill (`references/format.md`, `references/motion.md`, `references/look.md`), `hyperframes-registry` for ready-made pieces, `media-use` for audio, `hyperframes-cli` for lint/check/render. Skip the storyline step, `SPEC.md`, usage, history, feedback and REVIEW.md; `check` is the gate. Local assets for every runtime, font, stylesheet and sound. Keep creation and rendering local.
