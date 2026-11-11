# Brag Plan: pq

## What is this app?
pq is post-quantum messaging on Ethereum for private payments: keys travel with Kyber512 and a zero-knowledge proof made in your browser, so what you hand over stays private even once quantum computers arrive, and the chain can't see who's talking.

## The angle
**Today's private payments have a quantum expiry date.** Their viewing keys use ECDH, which isn't post-quantum, so one day every auditor commitment becomes public (README: "Messages encrypted to today's elliptic-curve keys can be harvested now and decrypted once a large quantum computer exists"). pq is the fix: the real Chat screen hands over a key with its own cheerful "Doing some secret math, right here in your browser…", and the ending's locks stay closed for years. The opening locks and the ending locks rhyme.

## Hook (first 2-3 seconds)
On the app's own light blue: "Private payment viewing keys aren't post-quantum secure." Two of the Landing's lock circles: *today* closed in cobalt, *with a quantum computer* popping open in coral on the beat.

## Key moments (the middle)
- The Landing's private-payment card decrypting in front of you: the hex becomes "100 USDC", "from ? to ?" fills in with both addresses, the two creatures pop in either side, "🔓 decrypted".
- The real Chat screen: a cursor taps **Say hi 👋**, the creature avatar bounces, "Doing some secret math, right here in your browser…", then confetti and "You're connected!".
- The Messages composer typing "here's the claiming key 🔑" with its 62-byte countdown, send, confetti, the bubble pops in under "You said".
- The Landing's three cobalt locks, all staying closed: today, in 10 years, in 20 years.

## Outro / punchline
"Your turn: say hi." The CTA button gets tapped on the track's strong cue and bursts the app's confetti. GitHub mistcash/pq and MIST.cash pills.

## User flow worth showing
Entry: the Chat screen for a person you picked ("Only they can read what you write." + Say hi 👋) → key action: tap Say hi, the browser proves the Channel opening ("Doing some secret math…") → result: "You're connected!", then a message sent from the composer, landing as a bubble.

## Tone
- Preset: default
- Creative direction: a playful, polished launch built from the app's own cards, creatures and confetti (DESIGN.md: "very playful and polished … insanely simple and minimal"), opening on a real threat stated plainly
- Interpretation: 8 short beats at 120 BPM on light grounds throughout; springy pops (the app's own `pop` curve) for arrivals, blur swaps between beats, no dark or ominous frames.

## Format: landscape — 1920x1080
## Duration: 23 s

## Visual identity (from the project)
- Background: `#E3EDF5` (base-200), `#FFFFFF` (base-100)
- Accent: `#0052FF` (primary, MIST cobalt); `#FF8863` (error) for what quantum computers break; confetti also `#FFCF72` (warning)
- Text: `#081019` (base-content); muted copy is that at 70% opacity
- Display font: Fredoka 700 (the app's `next/font` face)
- Body font: Fredoka 400/500
- Strongest visual element: the Landing's lock timeline (`app/_components/Landing.tsx`), shown broken for ECDH and whole for pq; the keccak creature avatars (`components/Avatar.tsx`)
- Radii: field 1rem, box 1.5rem, selector 2rem (DaisyUI 5 light theme overrides in `styles/globals.css`)

Stand-ins: the chat partner and "me" are fictional addresses (`0x7A3f…9C2e`, `0x3A9f…c21E`); the payment's parties use the Landing's own ALICE/BOB constants. No real user data.

## Share copy (draft)
Private payment viewing keys aren't post-quantum secure: one day every auditor commitment becomes public. pq hands keys over with Kyber512 instead.

## Audio direction
- Role: warm, upbeat bed with motion-matched UI accents
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (120.19 BPM, full energy from 0 s)
- Music treatment: bright from the first frame; 0.7 s fade under the end card; final mix mastered to about −16 LUFS
- Music cue guidance: preset `assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json` read. Beat grid 0.02 + 0.5·k s. Strong cues locked: 17.02 / 17.52 / 18.02 (Lasting's locks), 21.01 (the outro CTA tap). Beat-grid windows: opening locks 0.52 / 1.02, unlock 1.52, decrypt 3.52, perks 6.52 / 7.02 / 7.52 (revealed a beat apart, then held), Say-hi chips 10.52 / 11.52 / 12.52.
- Audio-reactive treatment: subtle; the music's bass gives the Lasting locks a soft glow. No waveform or equalizer visuals.
- SFX posture: moderate, motion-matched; low high-frequency-risk files for anything repeated
- Audio-coupled moments: the lock latching and unlocking, the decrypt, three cursor taps, typed message, the Lasting locks, success confetti, the final CTA
- Restraint rule: no stacked hits on a cut, no sound without a visible cause, keys thinned out under the music

## Storyboard

### Scene 1 — Keys — 3.0 s
Light blue ground. "Private payment viewing keys aren't post-quantum secure." blurs in at once and holds. Lock *today* (cobalt, closed) pops on 0.52, lock *with a quantum computer* on 1.02, and it springs open in coral on 1.52 with a little shake.
Sequential/interaction: yes — locks one per beat, then the unlock; headline held ~2.6 s
Audio intent: light but uneasy
Audio-coupled idea: a latch on the first lock, a click as the second opens
Transition mood: soft → Scene 2 (blur away on the same ground)

### Scene 2 — Leak — 3.0 s
"One day, every auditor commitment becomes public." word by word. The Landing's private-payment card (Private payment · hex · made in your payments app · from ? to ?) decrypts on 3.52: "100 USDC", "from 0x0100…0000 to 0x0500…0000", a coral "🔓 decrypted" badge and border; Alice and Bob pop in either side.
Sequential/interaction: yes — decrypt, then the two parties a beat apart; headline held ~2.5 s
Audio intent: the reveal lands
Audio-coupled idea: a soft impact on the decrypt
Transition mood: soft → Scene 3

### Scene 3 — Title — 3.5 s
Laid out like the app's own `public/thumbnail.jpg`: the pq logo tile with a white rim, and the verbatim tagline "Scalable, post-quantum cryptographic messaging for private payments and peer coordination." The Register card's perks pop in: 🔒 Post-quantum · 🌍 On Ethereum · 🙈 The chain can't see who's talking.
Sequential/interaction: yes — perks a beat apart, then held; tagline held ~3 s
Audio intent: confident, the fix arrives
Audio-coupled idea: a warm accent as the logo lands
Transition mood: clean → Scene 4 (slide left)

### Scene 4 — Say hi — 4.5 s
Right: the app frame (header with 🤿 Deep dive and the wallet pill) on the Chat screen. A cursor taps **Say hi 👋** at 10.0; the avatar bounces on the beat; "Doing some secret math, right here in your browser…"; at 13.0 confetti and "You're connected!". Left: "Say hi 👋" with chips 🔒 Kyber512, post-quantum · 🧮 A zero-knowledge proof · 💻 Made in your browser.
Sequential/interaction: yes — simulated tap; chips on every other beat
Audio intent: playful anticipation, then a payoff
Audio-coupled idea: click on the tap, success bell on "You're connected!"
Transition mood: continuous → Scene 5 (the same app scrolls down)

### Scene 5 — Send — 3.0 s
The app scrolls to "You said": the composer types "here's the claiming key 🔑", the counter counts down from 62 to 34, a tap on send at 15.5, confetti, the bubble pops in with "See it on Etherscan". Left: "🙈 The chain can't see who's talking."
Sequential/interaction: yes — typing, then a tap
Audio intent: light, quick, satisfied
Audio-coupled idea: a few soft key ticks, a click on send
Transition mood: soft → Scene 6 (the app slides out, white rises from below)

### Scene 6 — Lasting — 3.0 s
The Landing's "Lasting" beat, answering the opening: "Private now, and for years to come." Three cobalt locks pop on 17.02 / 17.52 / 18.02 and stay closed: today · in 10 years · in 20 years. Tags Kyber512 · zero-knowledge proofs · Poseidon2.
Sequential/interaction: yes — locks one per beat; title held ~2.5 s
Audio intent: resolved, steady
Audio-coupled idea: a latch for each lock
Transition mood: soft → Scene 7 (light blue rises from below)

### Scene 7 — Your turn — 3.0 s
Logo tile, "Your turn: say hi.", "It's live on Sepolia.", the **Say hi 👋 ↑** CTA tapped on 21.02 with confetti, GitHub mistcash/pq and MIST.cash pills. Held still to the end.
Sequential/interaction: yes — simulated tap on the CTA
Audio intent: a warm, resolved ending
Audio-coupled idea: click + bell on the tap, music fades under the end card
Transition mood: end

**Music mood for this video:** upbeat
**Audio summary:** an upbeat 120 BPM bed from the first frame, with latches as the opening lock breaks and the closing locks hold, clicks where the app is touched, and bells on the two payoffs, fading under the end card.
