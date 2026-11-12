# Brag Plan: pq

## What is this app?
pq is post-quantum messaging on Ethereum for private payments: keys travel with Kyber512 and a zero-knowledge proof made in your browser, so what you hand over stays private even once quantum computers arrive, and the chain can't see who's talking.

## The angle
**Today's private payments have a quantum expiry date, told as a chat.** alice.eth pays her supplier privately; her auditor, bob.eth, needs her viewing key, and she seals it to him on-chain with ECDH, the way Starknet's STRK20 escrows viewing keys to its auditor. Then "⚛️ Years later, a quantum computer joined the chat" and the key flips to "🔓 decrypted": private payments are sealed with ECDH (Stark-curve ECDH in STRK20, Jubjub/Pallas DH in Zcash, X25519 in Privacy Pools v2), and quantum computers break it, so what's recorded today is readable later: your payment history. pq is the fix: the same two people in the real pq Chat screen, Alice sending Bob her viewing key with Kyber512, with its own cheerful "Doing some secret math, right here in your browser…", and the ending's locks stay closed for years.

Every claim about viewing keys is checked against primary sources in `docs/research/viewing-keys.md`. "Auditor commitments" (an earlier caption) is not a term any of the three protocols use, so it was dropped.

## People
alice.eth and bob.eth, crypto's classic pair, drawn as people rather than bots: Notionists by Zoish (CC0 1.0, via DiceBear), Alice with long hair on the app's warm yellow `#FFCF72`, Bob with curly hair on misty `#ACC4D6`. They're fictional characters; no real person's name or likeness is used (the user's first idea, vitalik.eth with Vitalik's face, would imply he uses or endorses pq).

## Pace
- Every headline, caption and key in-app line arrives **word by word at reading pace**: 0.3 s a word (about 200 words a minute), each word blurring in over 0.2 s and staying.
- Chat messages arrive whole, each given 0.5 s + 0.3 s a word before the next one.
- Everything on screen then **holds at least 2 s** after its last word or element lands before the scene changes.
- Readable text is at least ~30 px on screen; only navbar chrome and "See it on Etherscan" stay smaller, as texture.
- The video runs as long as that takes: 56.6 s.

## Hook (first 2-3 seconds)
A chat window lands mid-frame with bob.eth, tagged "🧾 auditor", "on Ethereum" in its header, and Alice's first message pops in at 0.34 s: "Paid my supplier 100 USDC, privately 🤫".

## Key moments (the middle)
- "⚛️ Years later, a quantum computer joined the chat" as the beat drops, the window jolts, Alice's "🔑 My viewing key, sealed to you on-chain" goes from "🔒 ECDH-encrypted" to a larger, glowing "🔓 decrypted".
- The real Chat screen, alice.eth to bob.eth: a cursor taps **Say hi 👋**, Bob's face bounces, "Doing some secret math, right here in your browser…", then confetti and "You're connected!".
- The Messages composer typing "here's my viewing key 🔑" with its 62-byte countdown, send, confetti, the bubble pops in under "You said".
- The Landing's three cobalt locks, all staying closed: today, in 10 years, in 20 years.

## Outro / punchline
"Your turn: say hi." and "It's live on Sepolia." beside the Ethereum diamond. The CTA button gets tapped and bursts the app's confetti. GitHub mistcash/pq and MIST.cash pills.

## Tone
- Preset: default
- Creative direction: a playful, polished launch built from the app's own cards, chat bubbles and confetti, opening on a relatable chat with a real threat, never rushed
- Interpretation: 5 scenes on light grounds at reading pace; springy pops (the app's own `pop` curve) for arrivals, word-by-word blur-ins for text, the chat stepping aside for the captions, wipes between beats.

## Format: landscape — 1920x1080
## Duration: 56.6 s

## Visual identity (from the project)
- Background: `#E3EDF5` (base-200), `#FFFFFF` (base-100)
- Accent: `#0052FF` (primary, MIST cobalt); `#FF8863` (error) for what quantum computers break; confetti also `#FFCF72` (warning)
- Text: `#081019` (base-content); muted copy is that at 70% opacity
- Display font: Fredoka 700 (the app's `next/font` face); body Fredoka 400/500
- Ethereum: the classic grey diamond (`assets/img/ethereum.svg`) in the hook chat's header, on the "On Ethereum" perk and beside "It's live on Sepolia."
- Strongest visual element: DaisyUI chat bubbles shared by the hook and the real app; the Landing's lock timeline (`app/_components/Landing.tsx`)
- Radii: field 1rem, box 1.5rem, selector 2rem (DaisyUI 5 light theme overrides in `styles/globals.css`)

## Share copy (draft)
Private payments and their viewing keys are sealed with ECDH, and quantum computers break it: recorded today, readable later. pq hands keys over with Kyber512.

## Audio direction
- Role: a cool, nocturnal electronic bed that holds back under the problem and drops in at the twist
- Music: "Ethernight Club" by Kevin MacLeod (incompetech.com), CC BY 4.0, 117.6 BPM (synths, marimba, bells, percussion; "2am. It is raining…"). The credit must go wherever the video is posted (it's in `share-copy.txt`).
- Music treatment: starts 6.356 s into the track, so its quiet, mysterious intro plays under the chat and its beat drops on "⚛️ Years later, a quantum computer joined the chat" (10.08 s, measured 10.07 s in the render); 0.7 s fade under the end card; final mix mastered to about −16 LUFS
- Music cue guidance: kicks every 0.513 s from 10.08 s. Chat messages, the unlock, the chat stepping aside, every scene start, "You're connected!", the send and the CTA tap sit on (or within 0.07 s of) the beat; word reveals follow reading pace.
- Audio-reactive treatment: subtle; the music's bass gives the Lasting locks a glow. No waveform or equalizer visuals.
- SFX posture: moderate, motion-matched; soft drops for arriving messages, a short glitch when the quantum computer joins
- Restraint rule: no stacked hits on a cut, no sound without a visible cause, keys thinned out under the music

## Storyboard

### Scene 1 — Chat (the problem) — 0–21.37 s
The chat window lands mid-frame (bob.eth, 🧾 auditor, ⟠ on Ethereum). Alice: "Paid my supplier 100 USDC, privately 🤫" (0.34). Bob: "Nice. For the audit, I need your viewing key 🧾" (2.9). Alice types (6.1), then "🔑 My viewing key, sealed to you on-chain" with "🔒 ECDH-encrypted" (7.0). "⚛️ Years later, a quantum computer joined the chat" (10.08) as the beat drops in, the window jolts, the tag flips to a larger, glowing "🔓 decrypted" (10.6). The chat steps right (13.16) and the captions build word by word: "Private payments are sealed with ECDH. Quantum computers break it." (13.5–16.4), "Recorded today, readable later: your payment history." (16.9–18.9). Held to 20.9, out by 21.12.
Audio: drops on each message (0.36, 2.93, 7.03), glitch 10.1, unlock click 10.62.

### Scene 2 — Title — 21.37–28.03 s
Logo tile, the verbatim tagline word by word, perks 🔒 Post-quantum and ⟠ On Ethereum (24.88 / 25.18). Held 2 s, slides out left.
Audio: warm accent on the logo 21.4.

### Scene 3 — Say hi and send (the solution) — 28.03–43.73 s
The pq app slides in, alice.eth in its header, on the Chat screen for bob.eth. "Say hi 👋" word by word; "Only they can read what you write." gets its reading time; the tap on 31.05. "Doing some secret math, right here in your browser…" word by word while Bob's face bounces on the beats; chips 🔒 Kyber512, post-quantum · 🧮 A zero-knowledge proof · 💻 Made in your browser. Confetti and "You're connected!" on 35.72. The caption becomes "🙈 The chain can't see who's talking." word by word as the app scrolls to "You said" and types "here's my viewing key 🔑" (62 → 37); send on 40.85. Held 2 s, out by 43.73.
Audio: click 31.07, success bell 35.74, key ticks 39.63–40.43, click 40.87.

### Scene 4 — Lasting — 43.93–50.15 s
White rises. "Lasting", then "Private now, and for years to come." word by word; three cobalt locks latch on 46.45 / 46.95 / 47.45 and stay closed. Held 2 s, out by 50.15.
Audio: latches 46.47 / 46.97 / 47.47.

### Scene 5 — Your turn — 50.59–56.6 s
Logo, "Your turn: say hi." word by word, ⟠ "It's live on Sepolia.", the CTA and pills, the tap and confetti on 54.11, then held still to the end.
Audio: click 54.13, final bell 54.15, music fades under the end card.

**Music mood for this video:** cool, nocturnal, mysterious
**Audio summary:** a quiet, mysterious intro under the chat with soft drops as messages land, the beat dropping in with a glitch as the quantum computer joins, then a steady night-drive groove with clicks where the pq app is touched, latches for the closing locks, and bells on the two payoffs.
