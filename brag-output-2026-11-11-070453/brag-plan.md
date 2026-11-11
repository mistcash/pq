# Brag Plan: pq

## What is this app?
pq is private messaging on Ethereum: every message is stored publicly on-chain, yet only the two ends of a conversation can read it, the chain can't see who's talking, and the keys travel post-quantum (Kyber512) with a zero-knowledge proof made in your browser.

## The angle
**Public, forever, and still private.** Open on the scary truth of a public chain (a wall of ciphertext and the app's own dashed "On-chain, for all to see · from ? to ?" card), flip it with one wipe into the app's friendly hand-off (Alice sends the claiming key, Bob says "got the key! 🎉"), then let the real Chat screen do it with its own cheerful copy: "Doing some secret math, right here in your browser…".

## Hook (first 2-3 seconds)
Ink-dark frame, columns of hex drifting up, the Landing's dashed Public card popping in with two cobalt hex pills and "from ? to ?". "Public." then "Forever." slam in on the beats. Two words, held to 2.0 s.

## Key moments (the middle)
- The circle of light opening from the Public card into the Landing's hand-off row: cobalt "🔑 claiming key" bubble on the left, "got the key! 🎉" on the right, the hex churning as the message lands.
- The real Chat screen: a cursor taps **Say hi 👋**, the creature avatar bounces, "Doing some secret math, right here in your browser…", then confetti and "You're connected!".
- The Messages composer typing "here's the claiming key 🔑" with its 62-byte countdown, send, confetti, the bubble pops in under "You said".
- The Landing's three cobalt locks: today, in 10 years, in 20 years.

## Outro / punchline
"Your turn: say hi." The CTA button gets tapped on the track's strong cue and bursts the app's confetti. GitHub mistcash/pq and MIST.cash pills.

## User flow worth showing
Entry: the Chat screen for a person you picked ("Only they can read what you write." + Say hi 👋) → key action: tap Say hi, the browser proves the Channel opening ("Doing some secret math…") → result: "You're connected!", then a message sent from the composer, landing as a bubble.

## Tone
- Preset: default
- Creative direction: a playful, polished launch built from the app's own cards, creatures and confetti (DESIGN.md: "very playful and polished … insanely simple and minimal")
- Interpretation: 7 short scenes at a comfortable 120 BPM; springy pops (the app's own `pop` curve) for arrivals, clean wipes between worlds, one dark-to-light flip, no generic motion filler.

## Format: landscape — 1920x1080
## Duration: 22 s

## Visual identity (from the project)
- Background: `#E3EDF5` (base-200), `#FFFFFF` (base-100); hook ground `#081019` (neutral/ink)
- Accent: `#0052FF` (primary, MIST cobalt); confetti also `#FFCF72` (warning)
- Text: `#081019` (base-content); muted copy is that at 70% opacity
- Display font: Fredoka 700 (the app's `next/font` face)
- Body font: Fredoka 400/500
- Strongest visual element: the keccak-generated creature avatars (`components/Avatar.tsx`) and the dashed on-chain Public card (`app/_components/Landing.tsx`)
- Radii: field 1rem, box 1.5rem, selector 2rem (DaisyUI 5 light theme overrides in `styles/globals.css`)

Stand-ins: the chat partner and "me" are fictional addresses (`0x7A3f…9C2e`, `0x3A9f…c21E`); the hand-off avatars use the Landing's own ALICE/BOB constants. No real user data.

## Share copy (draft)
Every pq message sits on Ethereum for anyone to see, and only the two of you can read it.

## Audio direction
- Role: warm, upbeat bed with motion-matched UI accents
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (120.19 BPM, full energy from 0 s, lifts about +3 dB at 16 s)
- Music treatment: start at 0; sit a little under during the dark hook and open up on the 2.0 s reveal; short fade under the end card from about 21.3 s
- Music cue guidance: preset `assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json` read. Beat grid 0.02 + 0.5·k s. Strong cues to lock: 16.02 (Lasting: the section lift), 20.02 (the outro CTA tap). Beat-grid windows: perk chips 6.02 / 7.02 / 8.02 (every other beat, they are text), Say-hi chips 9.52 / 10.52 / 11.52, locks 16.02 / 16.52 / 17.02 (icons, every beat is fine).
- Audio-reactive treatment: subtle; music RMS/bass gives the hook's hex field and the Lasting locks a soft glow/presence. No waveform or equalizer visuals.
- SFX posture: moderate, motion-matched; low high-frequency-risk files for anything repeated
- Audio-coupled moments: the reveal wipe, three cursor taps, typed message, the locks latching, success confetti, the final CTA
- Restraint rule: no stacked hits on a cut, no sound without a visible cause, keys thinned out under the music

## Storyboard

### Scene 1 — Hook — 2.0 s
Ink ground, drifting hex columns, the Landing's dashed Public card (👁 On-chain, for all to see · `0x4be1…a07c` · `0x09a7…77e2` · from ? to ?). "Public." at 0.25, "Forever." at 0.75, both held to 2.0.
Sequential/interaction: yes — the two words slam in one beat apart (short labels, held ≥ 1.2 s)
Audio intent: tension under an upbeat bed; the chain is watching
Audio-coupled idea: none (let the music carry it; the reveal gets the first hit)
Music: bed slightly under
Transition mood: dramatic → Scene 2 (a circle of light opens from the card, 0.45 s)

### Scene 2 — Reveal — 3.0 s
Baby-blue ground. "Only the two of you can read it." The hand-off row: ALICE with "🔑 claiming key" (cobalt bubble) pops on 2.52, arrow, the Public card (now light), arrow, BOB with "got the key! 🎉" on 3.02. The hex pills churn as Alice's message lands.
Sequential/interaction: yes — Alice, then Bob, a beat apart; headline held 2.35 s
Audio intent: relief, brightness opens up
Audio-coupled idea: soft major-reveal hit on the wipe at 2.0
Transition mood: soft → Scene 3 (old out 4.75–5.0, new in from 5.0)

### Scene 3 — Title — 3.5 s
Laid out like the app's own `public/thumbnail.jpg`: the pq logo tile with a white rim, and the verbatim tagline "Scalable, post-quantum cryptographic messaging for private payments and peer coordination." The Register card's perks pop in: 🔒 Post-quantum · 🌍 On Ethereum · 🙈 The chain can't see who's talking.
Sequential/interaction: yes — perks on every other beat (6.02 / 7.02 / 8.02); tagline held ~3 s
Audio intent: confident, the name lands
Audio-coupled idea: a warm accent as the logo lands
Transition mood: clean → Scene 4 (slide left)

### Scene 4 — Say hi — 4.5 s
Right: the app frame (header with 🤿 Deep dive and the wallet pill) on the Chat screen: "← People", the partner's creature, "Only they can read what you write." and **Say hi 👋**. A cursor taps it at 9.0; the avatar bounces on the beat; "Doing some secret math, right here in your browser…" for 2.9 s; at 12.0 confetti and "You're connected!". Left: "Say hi 👋" with chips 🔒 Kyber512, post-quantum · 🧮 A zero-knowledge proof · 💻 Made in your browser.
Sequential/interaction: yes — simulated tap; chips on every other beat
Audio intent: playful anticipation, then a payoff
Audio-coupled idea: click on the tap, success bell on "You're connected!"
Transition mood: continuous → Scene 5 (the same app scrolls down)

### Scene 5 — Send — 3.0 s
The app scrolls to "You said": the composer types "here's the claiming key 🔑", the counter counts down from 62 to 34, a tap on send at 14.5, confetti, the bubble pops in with "See it on Etherscan". Left: "🙈 The chain can't see who's talking." held 2.45 s.
Sequential/interaction: yes — typing, then a tap
Audio intent: light, quick, satisfied
Audio-coupled idea: a few soft key ticks, a click on send
Transition mood: soft → Scene 6 (the app slides out, white rises from below)

### Scene 6 — Lasting — 3.0 s
The Landing's "Lasting" beat: "Private now, and for years to come." Three cobalt lock circles pop on 16.02 / 16.52 / 17.02 along a dashed line: today · in 10 years · in 20 years. Tags Kyber512 · zero-knowledge proofs · Poseidon2.
Sequential/interaction: yes — locks one per beat (icons), title held 2.45 s
Audio intent: the music lifts with it
Audio-coupled idea: a latch sound for each lock
Transition mood: soft → Scene 7 (baby blue rises from below)

### Scene 7 — Your turn — 3.0 s
Logo tile, "Your turn: say hi.", "It's live on Sepolia.", the **Say hi 👋 ↑** CTA tapped on 20.02 with confetti, GitHub mistcash/pq and MIST.cash pills. Held still to the end.
Sequential/interaction: yes — simulated tap on the CTA
Audio intent: a warm, resolved ending
Audio-coupled idea: click + bell on the tap, music fades under the end card
Transition mood: end

**Music mood for this video:** upbeat
**Audio summary:** an upbeat 120 BPM bed that sits a touch under the dark hook, opens on the reveal, lifts with the track at 16 s for "Lasting", and fades under the end card, with a handful of clicks, latches and bells where the app is touched.
