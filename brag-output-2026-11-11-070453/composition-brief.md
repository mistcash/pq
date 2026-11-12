# Hyperframes Composition Brief: pq

## Objective
Create a short launch-style brag video for pq.

## Output
- Composition directory: `brag-output-2026-11-11-070453/composition/`
- Rendered video: `brag-output-2026-11-11-070453/brag.mp4`
- Format: landscape — 1920x1080, 30 fps
- Duration: 56.6 s (the user asked for 30 s or more, with nothing rushed)

## Source Material
- Project root: the repo root (`mistcash/pq`)
- Primary files read: `README.md`, `DESIGN.md`, `GLOSSARY.md`, `packages/nextjs/app/page.tsx`, `app/layout.tsx`, `styles/globals.css`, `app/_components/{Landing,Register,People,Chat,Messages,Restore}.tsx`, `components/{Header,Avatar,Confetti,DeepDive,TxLink}.tsx`, `public/logo.svg`, `public/thumbnail.jpg`
- Product name: pq
- Tagline / strongest claim: "Scalable, post-quantum cryptographic messaging for private payments and peer coordination."
- Key UI or visual moment to recreate: the Chat screen's Say hi → "Doing some secret math, right here in your browser…" → "You're connected!" with confetti; the Landing's dashed Public card and hand-off row; the creature avatars
- Copy that must appear verbatim (the first two lines are the user's own framing, grounded in the README's "Messages encrypted to today's elliptic-curve keys can be harvested now and decrypted once a large quantum computer exists"):
  - Private payments are sealed with ECDH. Quantum computers break it.
  - Recorded today, readable later: your payment history.
  - Paid my supplier 100 USDC, privately 🤫 / Nice. For the audit, I need your viewing key 🧾 / 🔑 My viewing key, sealed to you on-chain / 🔒 ECDH-encrypted / 🔓 decrypted / ⚛️ Years later, a quantum computer joined the chat (the hook chat, written for the video; checked against `docs/research/viewing-keys.md`)
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
- Interpretation: 5 scenes on light grounds; every headline, caption and key in-app line arrives word by word at 0.3 s a word (about 200 wpm) and holds 2 s after it lands before the scene changes; readable labels ≥ ~30 px on screen
- Angle: today's private payments have a quantum expiry date. Payments and the viewing keys handed to auditors are sealed with ECDH, which quantum computers break, so a payment history recorded today is readable later; pq hands keys over with Kyber512 instead, and the ending's locks answer the opening's broken one.
- Hook: alice.eth seals her viewing key to her auditor bob.eth on-chain, until "⚛️ Years later, a quantum computer joined the chat" and the key flips to "🔓 decrypted"
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
- Ethereum: the classic grey diamond, `assets/img/ethereum.svg`
- People: alice.eth and bob.eth as Notionists faces by Zoish (CC0 1.0, via DiceBear), `assets/img/alice.svg` and `bob.svg`; fictional, no real person's name or likeness
- Body font: Fredoka 400/500
- Visual references from the project: DaisyUI 5 card/btn/chat/input with the app's light theme; Tailwind v4 classes copied from the JSX; keccak creature avatars (ported to `assets/avatar.js`); the app's `pop` curve `cubic-bezier(0.3, 1.6, 0.6, 1)` and confetti burst `cubic-bezier(0.1, 0.8, 0.3, 1)`; `public/logo.svg`

## Storyboard
Use the storyboard in `brag-output-2026-11-11-070453/brag-plan.md` as the creative contract.

Scene summary:
1. Chat — 0–21.37 s — alice.eth pays her supplier privately; her auditor bob.eth needs her viewing key; she seals it to him on-chain with ECDH; years later a quantum computer joins and it's decrypted; then "Private payments are sealed with ECDH. Quantum computers break it." and "Recorded today, readable later: your payment history." word by word
2. Title — 21.37–28.03 s — logo tile + verbatim tagline word by word + two perks (Post-quantum, ⟠ On Ethereum)
3. Say hi and send — 28.03–43.73 s — the pq app as alice.eth, Chat with bob.eth: tap, the secret-math line word by word, chips, "You're connected!", then "🙈 The chain can't see who's talking." word by word as "here's my viewing key 🔑" is sent with Kyber512
4. Lasting — 43.93–50.15 s — "Private now, and for years to come." word by word + three locks that stay closed
5. Your turn — 50.59–56.6 s — logo, "Your turn: say hi.", ⟠ "It's live on Sepolia.", CTA tap, pills

## Audio
- Audio role: a cool, nocturnal electronic bed with motion-matched UI accents
- Audio arc: the track's quiet, mysterious intro under the chat; its beat drops as the quantum computer joins (10.08 s); a steady groove through the fix; fades under the end card
- Music: `assets/music/ethernight-club-by-kevin-macleod.mp3` — "Ethernight Club" by Kevin MacLeod (incompetech.com), CC BY 4.0; credit in `share-copy.txt`
- Music treatment: `data-media-start="6.356"`, volume 0.38, 0.7 s fade-out; final mix mastered to about −16 LUFS
- Music cue guidance: kick grid measured from the track (first kick 16.44 s in the track, every 0.513 s, 117.6 BPM); beat-locked: the drop on 10.08 s; scene starts, chat messages, "You're connected!", the send and the CTA tap on the grid
- Audio-reactive treatment: subtle; bass breathes the Lasting locks' glow (`work/audio-data.json`, from the track at 6.356 s)
- Audio-coupled moments:
  - 0.36 / 2.93 / 7.03 — soft drops as each chat message arrives
  - 10.1 — a short glitch as the quantum computer joins; 10.62 — the unlock click
  - 21.4 — warm accent on the logo
  - 31.07, 40.87, 54.13 — cursor clicks
  - 35.74 — success bell with the confetti
  - 39.63–40.43 — a few key ticks
  - 46.47 / 46.97 / 47.47 — Lasting's lock latches
  - 54.15 — final bell with the CTA confetti
- SFX selection guidance: low high-frequency-risk Kenney files, rotate takes for repeats, SFX at 0.3–0.8 with repeats quieter
- SFX analysis guidance: `.claude/skills/brag/assets/sfx/sfx-analysis.md`
- Audio files: copied into `composition/assets/`

## Hyperframes Instructions
Composition contract per the `hyperframes` skill (`references/format.md`, `references/motion.md`, `references/look.md`), `hyperframes-registry` for ready-made pieces, `media-use` for audio, `hyperframes-cli` for lint/check/render. Skip the storyline step, `SPEC.md`, usage, history, feedback and REVIEW.md; `check` is the gate. Local assets for every runtime, font, stylesheet and sound. Keep creation and rendering local.
