# Brag Plan: pq

## What is this app?
pq is post-quantum messaging on Ethereum for private payments: keys travel with Kyber512 and a zero-knowledge proof made in your browser, so what you hand over stays private even once quantum computers arrive, and the chain can't see who's talking.

## The angle
**Today's private payments have a quantum expiry date.** Their viewing keys use ECDH, which isn't post-quantum, so one day every auditor commitment becomes public (README: "Messages encrypted to today's elliptic-curve keys can be harvested now and decrypted once a large quantum computer exists"). pq is the fix: the real Chat screen hands over a key with its own cheerful "Doing some secret math, right here in your browser…", and the ending's locks stay closed for years. The opening locks and the ending locks rhyme.

## Pace (the user's rule for this cut)
- Every headline, caption and key in-app line arrives **word by word at reading pace**: 0.3 s a word (about 200 words a minute), each word blurring in over 0.2 s and staying.
- Everything on screen then **holds at least 2 s** after its last word or element lands before the scene changes.
- Within a scene, nothing changes state until the text on screen has had its reading time.
- Readable labels are at least ~30 px on screen; only navbar chrome and "See it on Etherscan" stay smaller, as texture.
- The video runs as long as that takes: 47.5 s.

## Hook (first 2-3 seconds)
On the app's own light blue, the Ethereum diamond, then "Private payment viewing keys aren't post-quantum secure." word by word. Two of the Landing's lock circles: *today* closed in cobalt, *with a quantum computer* springing open in coral.

## Key moments (the middle)
- The Landing's private-payment card, tagged Ethereum, decrypting in front of you: the hex becomes "100 USDC", "from ? to ?" fills in with both addresses, the two creatures pop in either side, "🔓 decrypted".
- The real Chat screen: a cursor taps **Say hi 👋**, the creature avatar bounces, "Doing some secret math, right here in your browser…", then confetti and "You're connected!".
- The Messages composer typing "here's the claiming key 🔑" with its 62-byte countdown, send, confetti, the bubble pops in under "You said".
- The Landing's three cobalt locks, all staying closed: today, in 10 years, in 20 years.

## Outro / punchline
"Your turn: say hi." and "It's live on Sepolia." beside the Ethereum diamond. The CTA button gets tapped and bursts the app's confetti. GitHub mistcash/pq and MIST.cash pills.

## User flow worth showing
Entry: the Chat screen for a person you picked ("Only they can read what you write." + Say hi 👋) → key action: tap Say hi, the browser proves the Channel opening ("Doing some secret math…") → result: "You're connected!", then a message sent from the composer, landing as a bubble.

## Tone
- Preset: default
- Creative direction: a playful, polished launch built from the app's own cards, creatures and confetti (DESIGN.md: "very playful and polished … insanely simple and minimal"), opening on a real threat stated plainly, never rushed
- Interpretation: 6 scenes on light grounds at reading pace; springy pops (the app's own `pop` curve) for arrivals, word-by-word blur-ins for text, blur swaps and wipes between beats.

## Format: landscape — 1920x1080
## Duration: 47.5 s

## Visual identity (from the project)
- Background: `#E3EDF5` (base-200), `#FFFFFF` (base-100)
- Accent: `#0052FF` (primary, MIST cobalt); `#FF8863` (error) for what quantum computers break; confetti also `#FFCF72` (warning)
- Text: `#081019` (base-content); muted copy is that at 70% opacity
- Display font: Fredoka 700 (the app's `next/font` face)
- Body font: Fredoka 400/500
- Ethereum: the classic grey diamond (`assets/img/ethereum.svg`) above the opening headline, on the payment card, on the "On Ethereum" perk and beside "It's live on Sepolia."
- Strongest visual element: the Landing's lock timeline (`app/_components/Landing.tsx`), shown broken for ECDH and whole for pq; the keccak creature avatars (`components/Avatar.tsx`)
- Radii: field 1rem, box 1.5rem, selector 2rem (DaisyUI 5 light theme overrides in `styles/globals.css`)

Stand-ins: the chat partner and "me" are fictional addresses (`0x7A3f…9C2e`, `0x3A9f…c21E`); the payment's parties use the Landing's own ALICE/BOB constants. No real user data.

## Share copy (draft)
Private payment viewing keys aren't post-quantum secure: one day every auditor commitment becomes public. pq hands keys over with Kyber512 instead.

## Audio direction
- Role: warm, upbeat bed with motion-matched UI accents
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (120.19 BPM): groove 0–16 s, full 16–30 s, a quiet breakdown with no bass 32–40 s, back at 40 s
- Music treatment: bright from the first frame; 0.7 s fade under the end card; final mix mastered to about −16 LUFS
- Music cue guidance: beat grid 0.02 + 0.5·k s. Pops and taps sit on beats (2.52, 3.02, 4.02, 9.02, 22.02, 26.52, 32.02, 37.52…); word reveals follow reading pace, not the grid. Lasting's locks latch in the breakdown and the music returns during its hold.
- Audio-reactive treatment: subtle; the music's bass gives the Lasting locks a glow that swells as the music returns at 40 s. No waveform or equalizer visuals.
- SFX posture: moderate, motion-matched; low high-frequency-risk files for anything repeated
- Restraint rule: no stacked hits on a cut, no sound without a visible cause, keys thinned out under the music

## Storyboard

### Scene 1 — Keys — 0–6.5 s
Ethereum diamond pops (0.02). "Private payment viewing keys aren't post-quantum secure." word by word 0.3–2.3. Lock *today* 2.52, lock *with a quantum computer* 3.02, it springs open in coral 4.02. Held to 6.27, out by 6.5.
Audio: latch 2.54, click as it opens 4.04.

### Scene 2 — Leak — 6.5–12.5 s
The Ethereum-tagged private-payment card pops (6.52). "One day, every auditor commitment becomes public." word by word 6.8–8.8. Decrypted on 9.02: "100 USDC", "from 0x0100…0000 to 0x0500…0000", coral badge and border; Alice 9.32, Bob 9.52. Held to 12.0, out by 12.22.
Audio: soft impact on the decrypt 9.04.

### Scene 3 — Title — 12.5–19 s
Logo tile (12.52), the verbatim tagline word by word 12.8–15.7, perks 🔒 Post-quantum (16.02) and ⟠ On Ethereum (16.32). Held to 18.75, slides out left by 19.0.
Audio: warm accent on the logo 12.54.

### Scene 4 — Say hi — 19–30 s
The app slides in; "Say hi 👋" word by word. "Only they can read what you write." gets its reading time; the cursor taps Say hi on 22.02. "Doing some secret math, right here in your browser…" word by word 22.2–24.8 while the avatar bounces on the beats; chips 🔒 Kyber512, post-quantum · 🧮 A zero-knowledge proof · 💻 Made in your browser on 25.02 / 25.52 / 26.02. Confetti and "You're connected!" on 26.52, "They'll find your chat…" read until 29.8.
Audio: click 22.04, success bell 26.54.

### Scene 5 — Send — 30–34.7 s
The caption becomes "🙈 The chain can't see who's talking." word by word 30.2–32.2 while the app scrolls to "You said" and types "here's the claiming key 🔑" (62 → 34). Send on 32.02, confetti, the bubble pops in. Held to 34.45, out by 34.7.
Audio: a few key ticks 30.6–31.4, click 32.04.

### Scene 6 — Lasting — 35–41.2 s
White rises. "Lasting", then "Private now, and for years to come." word by word 35.3–37.3. Three cobalt locks latch on 37.52 / 38.02 / 38.52 and stay closed: today · in 10 years · in 20 years. The music returns at 40 s and the locks glow with it. Held to 41.0, out by 41.22.
Audio: latches 37.54 / 38.04 / 38.54.

### Scene 7 — Your turn — 41.5–47.5 s
Light blue rises. Logo, "Your turn: say hi." word by word 41.8–42.9, ⟠ "It's live on Sepolia." 43.1–44.2, the CTA (44.32) and pills (44.5), the tap and confetti on 45.02, then held still to the end.
Audio: click 45.04, final bell 45.06, music fades under the end card.

**Music mood for this video:** upbeat
**Audio summary:** an upbeat 120 BPM bed from the first frame, with latches as the opening lock breaks and the closing locks hold, clicks where the app is touched, and bells on the two payoffs; the track's quiet breakdown sits under the Lasting promise and it returns for the ending.
