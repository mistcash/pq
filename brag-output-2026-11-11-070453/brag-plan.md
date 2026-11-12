# Brag Plan: pq

## What is this app?
pq is post-quantum messaging on Ethereum for private payments: keys travel with Kyber512 and a zero-knowledge proof made in your browser, so what you hand over stays private even once quantum computers arrive, and the chain can't see who's talking.

## The angle
**Today's private payments have a quantum expiry date, told as a chat.** alice.eth pays bob.eth privately and sends him the viewing key for his auditor over an ECDH-encrypted chat. Then "⚛️ A quantum computer joined the chat" and the key's lock flips to "🔓 decrypted": private payment viewing keys aren't post-quantum secure, so one day every auditor commitment becomes public (README: "Messages encrypted to today's elliptic-curve keys can be harvested now and decrypted once a large quantum computer exists"). pq is the fix: the same two people in the real pq Chat screen, the same viewing key, sent with its own cheerful "Doing some secret math, right here in your browser…", and the ending's locks stay closed for years.

## People
alice.eth and bob.eth, crypto's classic pair, drawn as people rather than bots: Notionists by Zoish (CC0 1.0, via DiceBear), Alice with long hair on the app's warm yellow `#FFCF72`, Bob with curly hair on misty `#ACC4D6`. They're fictional characters; no real person's name or likeness is used (the user's first idea, vitalik.eth with Vitalik's face, would imply he uses or endorses pq).

## Pace
- Every headline, caption and key in-app line arrives **word by word at reading pace**: 0.3 s a word (about 200 words a minute), each word blurring in over 0.2 s and staying.
- Chat messages arrive whole, each given 0.5 s + 0.3 s a word before the next one.
- Everything on screen then **holds at least 2 s** after its last word or element lands before the scene changes.
- Readable text is at least ~30 px on screen; only navbar chrome and "See it on Etherscan" stay smaller, as texture.
- The video runs as long as that takes: 52.5 s.

## Hook (first 2-3 seconds)
A chat window lands mid-frame with bob.eth "on Ethereum" in its header, and Alice's first message pops in at 0.42 s: "Sent you 100 USDC, privately 🤫".

## Key moments (the middle)
- "⚛️ A quantum computer joined the chat", the window jolts, Alice's "🔑 viewing key" goes from "🔒 ECDH-encrypted" to "🔓 decrypted".
- The real Chat screen, alice.eth to bob.eth: a cursor taps **Say hi 👋**, Bob's face bounces, "Doing some secret math, right here in your browser…", then confetti and "You're connected!".
- The Messages composer typing "here's the viewing key 🔑" with its 62-byte countdown, send, confetti, the bubble pops in under "You said".
- The Landing's three cobalt locks, all staying closed: today, in 10 years, in 20 years.

## Outro / punchline
"Your turn: say hi." and "It's live on Sepolia." beside the Ethereum diamond. The CTA button gets tapped and bursts the app's confetti. GitHub mistcash/pq and MIST.cash pills.

## Tone
- Preset: default
- Creative direction: a playful, polished launch built from the app's own cards, chat bubbles and confetti, opening on a relatable chat with a real threat, never rushed
- Interpretation: 5 scenes on light grounds at reading pace; springy pops (the app's own `pop` curve) for arrivals, word-by-word blur-ins for text, the chat stepping aside for the captions, wipes between beats.

## Format: landscape — 1920x1080
## Duration: 52.5 s

## Visual identity (from the project)
- Background: `#E3EDF5` (base-200), `#FFFFFF` (base-100)
- Accent: `#0052FF` (primary, MIST cobalt); `#FF8863` (error) for what quantum computers break; confetti also `#FFCF72` (warning)
- Text: `#081019` (base-content); muted copy is that at 70% opacity
- Display font: Fredoka 700 (the app's `next/font` face); body Fredoka 400/500
- Ethereum: the classic grey diamond (`assets/img/ethereum.svg`) in the hook chat's header, on the "On Ethereum" perk and beside "It's live on Sepolia."
- Strongest visual element: DaisyUI chat bubbles shared by the hook and the real app; the Landing's lock timeline (`app/_components/Landing.tsx`)
- Radii: field 1rem, box 1.5rem, selector 2rem (DaisyUI 5 light theme overrides in `styles/globals.css`)

## Share copy (draft)
Private payment viewing keys aren't post-quantum secure: one day every auditor commitment becomes public. pq hands keys over with Kyber512 instead.

## Audio direction
- Role: warm, upbeat bed with motion-matched UI accents
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (120.19 BPM): groove 0–16 s, full 16–30 s, a quiet breakdown 32–40 s, back at 40 s
- Music treatment: bright from the first frame; 0.7 s fade under the end card; final mix mastered to about −16 LUFS
- Music cue guidance: beat grid 0.02 + 0.5·k s. Message pops and taps sit on beats; word reveals follow reading pace. The send lands in the quiet breakdown; Lasting starts as the music returns at 40 s.
- Audio-reactive treatment: subtle; the music's bass gives the Lasting locks a glow. No waveform or equalizer visuals.
- SFX posture: moderate, motion-matched; soft drops for arriving messages, a short glitch when the quantum computer joins
- Restraint rule: no stacked hits on a cut, no sound without a visible cause, keys thinned out under the music

## Storyboard

### Scene 1 — Chat (the problem) — 0–17.5 s
The chat window lands mid-frame (bob.eth, ⟠ on Ethereum). Alice: "Sent you 100 USDC, privately 🤫" (0.42). Bob: "Got it! My auditor needs the viewing key 🧾" (2.52). Alice types (4.75), then "🔑 viewing key: vk_7f3a…e1c9" with "🔒 ECDH-encrypted" (5.52). "⚛️ A quantum computer joined the chat" (7.52), the window jolts, the tag flips to "🔓 decrypted" (8.02). The chat steps right (10.02) and the captions build word by word: "Private payment viewing keys aren't post-quantum secure." (10.4–12.4), "One day, every auditor commitment becomes public." (12.9–14.9). Held to 16.9, out by 17.12.
Audio: drops on each message (0.44, 2.54, 5.54), glitch 7.54, unlock click 8.04.

### Scene 2 — Title — 17.5–24 s
Logo tile, the verbatim tagline word by word, perks 🔒 Post-quantum and ⟠ On Ethereum (21.02 / 21.32). Held 2 s, slides out left.
Audio: warm accent on the logo 17.54.

### Scene 3 — Say hi and send (the solution) — 24–39.7 s
The pq app slides in, alice.eth in its header, on the Chat screen for bob.eth. "Say hi 👋" word by word; "Only they can read what you write." gets its reading time; the tap on 27.02. "Doing some secret math, right here in your browser…" word by word while Bob's face bounces on the beats; chips 🔒 Kyber512, post-quantum · 🧮 A zero-knowledge proof · 💻 Made in your browser. Confetti and "You're connected!" on 31.52. The caption becomes "🙈 The chain can't see who's talking." word by word as the app scrolls to "You said" and types "here's the viewing key 🔑" (62 → 35); send on 37.02. Held 2 s, out by 39.7.
Audio: click 27.04, success bell 31.54, key ticks 35.6–36.4, click 37.04.

### Scene 4 — Lasting — 40–46.2 s
White rises as the music returns. "Lasting", then "Private now, and for years to come." word by word; three cobalt locks latch on 42.52 / 43.02 / 43.52 and stay closed. Held 2 s, out by 46.22.
Audio: latches 42.54 / 43.04 / 43.54.

### Scene 5 — Your turn — 46.5–52.5 s
Logo, "Your turn: say hi." word by word, ⟠ "It's live on Sepolia.", the CTA and pills, the tap and confetti on 50.02, then held still to the end.
Audio: click 50.04, final bell 50.06, music fades under the end card.

**Music mood for this video:** upbeat
**Audio summary:** an upbeat 120 BPM bed from the first frame, soft drops as the chat fills, a glitch as the quantum computer joins, clicks where the pq app is touched, latches for the closing locks, and bells on the two payoffs.
