# Hyperframes Composition Brief: pq

## Objective
Create a short launch-style brag video for pq.

## Output
- Composition directory: `brag-output-2026-11-11-070453/composition/`
- Rendered video: `brag-output-2026-11-11-070453/brag.mp4`
- Format: landscape — 1920x1080, 30 fps
- Duration: 22 s

## Source Material
- Project root: the repo root (`mistcash/pq`)
- Primary files read: `README.md`, `DESIGN.md`, `GLOSSARY.md`, `packages/nextjs/app/page.tsx`, `app/layout.tsx`, `styles/globals.css`, `app/_components/{Landing,Register,People,Chat,Messages,Restore}.tsx`, `components/{Header,Avatar,Confetti,DeepDive,TxLink}.tsx`, `public/logo.svg`, `public/thumbnail.jpg`
- Product name: pq
- Tagline / strongest claim: "Scalable, post-quantum cryptographic messaging for private payments and peer coordination."
- Key UI or visual moment to recreate: the Chat screen's Say hi → "Doing some secret math, right here in your browser…" → "You're connected!" with confetti; the Landing's dashed Public card and hand-off row; the creature avatars
- Copy that must appear verbatim:
  - Scalable, post-quantum cryptographic messaging for private payments and peer coordination.
  - On-chain, for all to see / from ? to ?
  - 🔑 claiming key / got the key! 🎉
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
- Interpretation: 7 short scenes on a 120 BPM grid; springy pops for arrivals, clean wipes between worlds, one dark-to-light flip, readable holds
- Angle: Public, forever, and still private. Open on the public chain's ciphertext, flip into the app's friendly hand-off, then let the real Chat screen do it with its own copy.
- Hook: "Public. Forever." over drifting hex and the dashed on-chain card
- Outro / punchline: "Your turn: say hi." with the CTA tapped on the strong cue
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Claims the project never makes (no "unbreakable", no numbers beyond the README's)

## Visual Identity
- Background: `#E3EDF5` / `#FFFFFF`; hook `#081019`
- Text: `#081019`
- Accent: `#0052FF`; confetti `#FFCF72`
- Display font: Fredoka 700 (shipped as `assets/fonts/fredoka-*.ttf` with `@font-face`)
- Body font: Fredoka 400/500
- Visual references from the project: DaisyUI 5 card/btn/chat/input with the app's light theme; Tailwind v4 classes copied from the JSX; keccak creature avatars (ported to `assets/avatar.js`); the app's `pop` curve `cubic-bezier(0.3, 1.6, 0.6, 1)` and confetti burst `cubic-bezier(0.1, 0.8, 0.3, 1)`; `public/logo.svg`

## Storyboard
Use the storyboard in `brag-output-2026-11-11-070453/brag-plan.md` as the creative contract.

Scene summary:
1. Hook — 2.0 s — ink, hex columns, dashed Public card, "Public. Forever."
2. Reveal — 3.0 s — circle of light; hand-off row; "Only the two of you can read it."
3. Title — 3.5 s — logo tile + verbatim tagline + three perks
4. Say hi — 4.5 s — app frame, tap, secret math, "You're connected!"
5. Send — 3.0 s — composer types, send, bubble; "🙈 The chain can't see who's talking."
6. Lasting — 3.0 s — "Private now, and for years to come." + three locks
7. Your turn — 3.0 s — logo, "Your turn: say hi.", CTA tap, pills

## Audio
- Audio role: warm bed with motion-matched UI accents
- Audio arc: a touch under the hook, opens on the reveal, lifts with the track at 16 s, fades under the end card
- Music: `assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`
- Music treatment: volume 0.38; a low-pass automated from 700 Hz to open at 2.02 s (muffled hook, bright reveal); 0.7 s fade-out
- Music cue guidance: bundled preset `.claude/skills/brag/assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json`; beats at 0.02 + 0.5·k; strong cues 16.02 and 20.02 to lock
- Audio-reactive treatment: subtle; RMS/bass breathe the hook's hex field brightness and the locks' glow
- Audio-coupled moments:
  - 2.0 reveal wipe — soft major-reveal hit
  - 5.0 logo — warm accent
  - 9.0, 14.5, 20.0 — cursor clicks
  - 12.0 — success bell with the confetti
  - 13.35–14.25 — a few key ticks
  - 16.02 / 16.52 / 17.02 — lock latches
  - 20.02 — final bell with the CTA confetti
- SFX selection guidance: low high-frequency-risk Kenney files (`interface/click_00x`, `impact/impactSoft_medium_001`, `interface/switch_00x`, `impact/impactBell_heavy_00x`, `keyboard/keypress-*`), rotate takes for repeats, SFX at 0.55–0.85 with repeats quieter
- SFX analysis guidance: `.claude/skills/brag/assets/sfx/sfx-analysis.md`
- Exact SFX choice: chosen against the implemented animation
- Audio files: copied into `composition/assets/`

## Hyperframes Instructions
Composition contract per the `hyperframes` skill (`references/format.md`, `references/motion.md`, `references/look.md`), `hyperframes-registry` for ready-made pieces, `media-use` for audio, `hyperframes-cli` for lint/check/render. Skip the storyline step, `SPEC.md`, usage, history, feedback and REVIEW.md; `check` is the gate. Local assets for every runtime, font, stylesheet and sound. Keep creation and rendering local.
