# Brag Plan: pq

## What is this app?
pq is post-quantum messaging on Ethereum for private payments: keys travel with Kyber512 and a zero-knowledge proof made in your browser, so what you hand over stays private even once quantum computers arrive, and the chain can't see who's talking.

## The angle
**Today's private payments have a quantum expiry date, told as a chat.** alice.eth pays bob.eth privately on a "⛓️ Chain with private payments", then sends him the claiming key and a viewing key for the auditor, each tagged "🔒 ECDH-encrypted". Then "⚛️ A quantum computer joined the chat", says "I broke ECDH 👀 Now I can read all your private messages", and both messages flip to "🔓 decrypted": private payment viewing keys aren't post-quantum secure, so one day every ECDH commitment becomes public (README: "Messages encrypted to today's elliptic-curve keys can be harvested now and decrypted once a large quantum computer exists"). pq is the fix: the same two people in the real pq Chat screen, the same viewing key, sent with its own cheerful "Doing some secret math, right here in your browser…", and the ending's locks stay closed for years.

## People
alice.eth and bob.eth, crypto's classic pair, drawn as people rather than bots: Notionists by Zoish (CC0 1.0, via DiceBear), Alice with long hair on the app's warm yellow `#FFCF72`, Bob with curly hair on misty `#ACC4D6`. They're fictional characters; no real person's name or likeness is used (the user's first idea, vitalik.eth with Vitalik's face, would imply he uses or endorses pq).

## Pace
- Every headline, caption and key in-app line arrives **word by word at reading pace**: 0.3 s a word (about 200 words a minute), each word blurring in over 0.2 s and staying.
- Chat messages arrive whole, each given 0.5 s + 0.3 s a word before the next one.
- Everything on screen then **holds at least 2 s** after its last word or element lands before the scene changes.
- Readable text is at least ~30 px on screen; only navbar chrome and "See it on Etherscan" stay smaller, as texture.
- The video runs as long as that takes: 55.62 s.

## Hook (first 2-3 seconds)
A chat window lands mid-frame with bob.eth and "⛓️ Chain with private payments" in its header, and Alice's first message pops in at 0.42 s: "Sent you 100 USDC, privately 🤫".

## Key moments (the middle)
- "⚛️ A quantum computer joined the chat", the window jolts, the quantum computer (an ⚛️ avatar) says, in an ordinary bubble: "I broke ECDH 👀 Now I can read all your private messages." Then Alice's two key messages flip from "🔒 ECDH-encrypted" to "🔓 decrypted", one a beat.
- The real Chat screen, alice.eth to bob.eth: a cursor taps **Say hi 👋**, Bob's face bounces, "Doing some secret math, right here in your browser…", then confetti and "You're connected!".
- The Messages composer typing "here's the viewing key 🔑" with its 62-byte countdown, send, confetti, the bubble pops in under "You said".
- The Landing's three cobalt locks, all staying closed: today, in 10 years, in 20 years.

## Outro / punchline
"Your turn: say hi." and "Live on Sepolia" beside the Ethereum diamond. The CTA button gets tapped and bursts the app's confetti. GitHub mistcash/pq and MIST.cash pills.

## Tone
- Preset: default
- Creative direction: a playful, polished launch built from the app's own cards, chat bubbles and confetti, opening on a relatable chat with a real threat, never rushed
- Interpretation: 5 scenes on light grounds at reading pace; springy pops (the app's own `pop` curve) for arrivals, word-by-word blur-ins for text, the chat stepping aside for the captions, wipes between beats.

## Format: landscape — 1920x1080
## Duration: 55.62 s

## Visual identity (from the project)
- Background: `#E3EDF5` (base-200), `#FFFFFF` (base-100)
- Accent: `#0052FF` (primary, MIST cobalt); `#FF8863` (error) for what quantum computers break; confetti also `#FFCF72` (warning)
- Text: `#081019` (base-content); muted copy is that at 70% opacity
- Display font: Fredoka 700 (the app's `next/font` face); body Fredoka 400/500
- Ethereum: the classic grey diamond (`assets/img/ethereum.svg`) on the "On Ethereum" perk and beside "Live on Sepolia"
- Strongest visual element: DaisyUI chat bubbles shared by the hook and the real app; the Landing's lock timeline (`app/_components/Landing.tsx`)
- Radii: field 1rem, box 1.5rem, selector 2rem (DaisyUI 5 light theme overrides in `styles/globals.css`)

## Share copy (draft)
Private payment viewing keys aren't post-quantum secure: one day every ECDH commitment becomes public. pq hands keys over with Kyber512 instead.

## Audio direction
- Role: a dark cyberpunk bed that holds back under the problem and comes in full at the twist
- Music: "Cyberpunk" by Poradovskyi, supplied by the user (the file name matches a Pixabay download), 102 BPM, 65.9 s, in 8-bar sections at 0.03 / 18.85 / 37.68 / 56.5 s, each after a short break; it winds down from 56.5 s.
- Music treatment: starts 10.306 s into the track, so its break at 18.26 s falls just before "⚛️ A quantum computer joined the chat" and its return (18.85 s) lands on it (8.55 s); its own wind-down plays under Lasting and the end card. Two clips of the file: 0.135 under the chat, 0.2 from the twist (the same +3.4 dB step the old track had), 0.7 s fade at the end; final mix mastered to about −16 LUFS
- Music cue guidance: beats every 0.588 s from 0.312 s (video time). Every scene starts on a beat (title and app on downbeats); messages, the decrypt flips, taps, confetti, chips, perks, locks and Bob's bounce land on beats; the twist on the track's return (8.55 s); word reveals follow reading pace.
- Audio-reactive treatment: subtle; the music's bass gives the Lasting locks a glow. No waveform or equalizer visuals.
- SFX posture: moderate, motion-matched; soft drops for arriving messages, a short glitch when the quantum computer joins
- Restraint rule: no stacked hits on a cut, no sound without a visible cause, keys thinned out under the music

## Storyboard

### Scene 1 — Chat (the problem) — 0–20.31 s
The chat window lands mid-frame (bob.eth, "⛓️ Chain with private payments"). Every message lands on a beat (0.312 + n × 0.588). Alice: "Sent you 100 USDC, privately 🤫" (0.31). Alice types (2.08), then "🔑 Your claiming key" (2.66) and "🧾 Viewing key, for the auditor" (4.43), each with a green "🔒 ECDH-encrypted". Bob: "Got it, thanks 🙏" (6.78). "⚛️ A quantum computer joined the chat" (8.55) as the track comes back from its break, and the window jolts. A beat later (9.14) the quantum computer says "I broke ECDH 👀 Now I can read all your private messages." and the thread scrolls up; Alice's two messages flip to "🔓 decrypted" (9.72 / 10.31). The chat steps right on the downbeat (13.25) and the captions build word by word: "Private payment viewing keys aren't post-quantum secure." (13.57–15.57), "One day, every ECDH commitment becomes public." (16.07–18.07). Held to 20.07, out by 20.29.
Audio: drops on each message (0.33, 2.68, 4.45, 6.8, 9.16), glitch 8.57, an unlock click per decrypted message (9.74 / 10.33).

### Scene 2 — Title — 20.31–27.37 s (starts on a downbeat)
Logo tile, the verbatim tagline word by word, perks 🔒 Post-quantum and ⟠ On Ethereum one a beat (23.84 / 24.43). Held 2 s, slides out left (27.12).
Audio: warm accent on the logo 20.35.

### Scene 3 — Say hi and send (the solution) — 27.37–43.25 s (starts on a downbeat)
The pq app slides in, alice.eth in its header, on the Chat screen for bob.eth. "Say hi 👋" word by word; "Only they can read what you write." gets its reading time; the tap on 30.31. "Doing some secret math, right here in your browser…" word by word while Bob's face bounces, landing every other beat; chips 🔒 Kyber512, post-quantum · 🧮 A zero-knowledge proof · 💻 Made in your browser, one a beat (33.25 / 33.84 / 34.43). Confetti and "You're connected!" on 35.02. The caption becomes "🙈 The chain can't see who's talking." word by word as the app scrolls to "You said" (38.55) and types "here's the viewing key 🔑" (62 → 35); send on 40.31. Held 2 s, out by 43.22.
Audio: click 30.33, success bell 35.04, key ticks 39.13–39.93, click 40.33.

### Scene 4 — Lasting — 43.25–49.72 s
White rises. "Lasting", then "Private now, and for years to come." word by word; three cobalt locks latch one a beat (45.60 / 46.19 / 46.78) and stay closed. Held 2 s, out by 49.47.
Audio: latches 45.62 / 46.21 / 46.8.

### Scene 5 — Your turn — 49.72–55.62 s
Logo, "Your turn: say hi." word by word, ⟠ "Live on Sepolia", the CTA on a beat (52.66) and pills, the tap and confetti on the next beat (53.25), then held still to the end.
Audio: click 53.27, final bell 53.29, the track winds down under the end card.

**Music mood for this video:** dark, driving, cyberpunk
**Audio summary:** the track held low under the chat with soft drops as messages land, then breaking and coming back in full with a glitch as the quantum computer joins, then a steady cyberpunk groove with clicks where the pq app is touched, latches for the closing locks, and bells on the two payoffs.
