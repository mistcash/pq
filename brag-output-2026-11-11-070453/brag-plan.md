# Brag Plan: pq

## What is this app?
pq is post-quantum messaging on Ethereum for private payments: keys travel with Kyber512 and a zero-knowledge proof made in your browser, so what you hand over stays private even once quantum computers arrive, and the chain can't see who's talking.

## The angle
**Today's private payments have a quantum expiry date, told as a chat.** alice.eth pays bob.eth privately and sends him the viewing key for his auditor over an ECDH-encrypted chat. The chat runs on a "⛓️ Chain with private payments", and the key sits there "🔒 ECDH-encrypted". Then "⚛️ A quantum computer joined the chat" and says "I broke ECDH 👀 Now I can read all your private messages": private payment viewing keys aren't post-quantum secure, so one day every auditor commitment becomes public (README: "Messages encrypted to today's elliptic-curve keys can be harvested now and decrypted once a large quantum computer exists"). pq is the fix: the same two people in the real pq Chat screen, the same viewing key, sent with its own cheerful "Doing some secret math, right here in your browser…", and the ending's locks stay closed for years.

## People
alice.eth and bob.eth, crypto's classic pair, drawn as people rather than bots: Notionists by Zoish (CC0 1.0, via DiceBear), Alice with long hair on the app's warm yellow `#FFCF72`, Bob with curly hair on misty `#ACC4D6`. They're fictional characters; no real person's name or likeness is used (the user's first idea, vitalik.eth with Vitalik's face, would imply he uses or endorses pq).

## Pace
- Every headline, caption and key in-app line arrives **word by word at reading pace**: 0.3 s a word (about 200 words a minute), each word blurring in over 0.2 s and staying.
- Chat messages arrive whole, each given 0.5 s + 0.3 s a word before the next one.
- Everything on screen then **holds at least 2 s** after its last word or element lands before the scene changes.
- Readable text is at least ~30 px on screen; only navbar chrome and "See it on Etherscan" stay smaller, as texture.
- The video runs as long as that takes: 54.55 s.

## Hook (first 2-3 seconds)
A chat window lands mid-frame with bob.eth and "⛓️ Chain with private payments" in its header, and Alice's first message pops in at 0.42 s: "Sent you 100 USDC, privately 🤫".

## Key moments (the middle)
- "⚛️ A quantum computer joined the chat", the window jolts, and the quantum computer (an ⚛️ avatar) says, in an ordinary bubble: "I broke ECDH 👀 Now I can read all your private messages."
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
## Duration: 54.55 s

## Visual identity (from the project)
- Background: `#E3EDF5` (base-200), `#FFFFFF` (base-100)
- Accent: `#0052FF` (primary, MIST cobalt); `#FF8863` (error) for what quantum computers break; confetti also `#FFCF72` (warning)
- Text: `#081019` (base-content); muted copy is that at 70% opacity
- Display font: Fredoka 700 (the app's `next/font` face); body Fredoka 400/500
- Ethereum: the classic grey diamond (`assets/img/ethereum.svg`) on the "On Ethereum" perk and beside "It's live on Sepolia."
- Strongest visual element: DaisyUI chat bubbles shared by the hook and the real app; the Landing's lock timeline (`app/_components/Landing.tsx`)
- Radii: field 1rem, box 1.5rem, selector 2rem (DaisyUI 5 light theme overrides in `styles/globals.css`)

## Share copy (draft)
Private payment viewing keys aren't post-quantum secure: one day every auditor commitment becomes public. pq hands keys over with Kyber512 instead.

## Audio direction
- Role: a cool, nocturnal electronic bed that holds back under the problem and drops in at the twist
- Music: "Ethernight Club" by Kevin MacLeod (incompetech.com), CC BY 4.0, 117.6 BPM (synths, marimba, bells, percussion; "2am. It is raining…"). The credit must go wherever the video is posted (it's in `share-copy.txt`).
- Music treatment: starts 8.92 s into the track, so its quiet, mysterious intro plays under the chat and its beat drops on "⚛️ A quantum computer joined the chat" (7.52 s, measured 7.51 s in the render); 0.7 s fade under the end card; final mix mastered to about −16 LUFS
- Music cue guidance: kicks every 0.513 s from 7.52 s. Chat messages, the unlock, the chat stepping aside, every scene start, "You're connected!", the send and the CTA tap sit on (or within 0.07 s of) the beat; word reveals follow reading pace.
- Audio-reactive treatment: subtle; the music's bass gives the Lasting locks a glow. No waveform or equalizer visuals.
- SFX posture: moderate, motion-matched; soft drops for arriving messages, a short glitch when the quantum computer joins
- Restraint rule: no stacked hits on a cut, no sound without a visible cause, keys thinned out under the music

## Storyboard

### Scene 1 — Chat (the problem) — 0–19.31 s
The chat window lands mid-frame (bob.eth, "⛓️ Chain with private payments"). Alice: "Sent you 100 USDC, privately 🤫" (0.34). Bob: "Got it! My auditor needs the viewing key 🧾" (2.39). Alice types (4.7), then "🔑 viewing key: vk_7f3a…e1c9" with a green "🔒 ECDH-encrypted" (5.47). "⚛️ A quantum computer joined the chat" (7.52) as the beat drops in, and the window jolts. A beat later (8.03) the quantum computer says "I broke ECDH 👀 Now I can read all your private messages." and Alice's key wobbles. The chat steps right (12.14) and the captions build word by word: "Private payment viewing keys aren't post-quantum secure." (12.45–14.45), "One day, every auditor commitment becomes public." (14.95–16.95). Held to 18.95, out by 19.17.
Audio: drops on each message (0.36, 2.41, 5.49), glitch 7.54, unlock click 8.05 as the reply lands.

### Scene 2 — Title — 19.31–25.98 s
Logo tile, the verbatim tagline word by word, perks 🔒 Post-quantum and ⟠ On Ethereum (22.83 / 23.13). Held 2 s, slides out left.
Audio: warm accent on the logo 19.35.

### Scene 3 — Say hi and send (the solution) — 25.98–41.68 s
The pq app slides in, alice.eth in its header, on the Chat screen for bob.eth. "Say hi 👋" word by word; "Only they can read what you write." gets its reading time; the tap on 26.95. "Doing some secret math, right here in your browser…" word by word while Bob's face bounces on the beats; chips 🔒 Kyber512, post-quantum · 🧮 A zero-knowledge proof · 💻 Made in your browser. Confetti and "You're connected!" on 31.62. The caption becomes "🙈 The chain can't see who's talking." word by word as the app scrolls to "You said" and types "here's the viewing key 🔑" (62 → 35); send on 36.75. Held 2 s, out by 39.63.
Audio: click 29.02, success bell 33.69, key ticks 37.58–38.38, click 38.82.

### Scene 4 — Lasting — 41.88–48.1 s
White rises. "Lasting", then "Private now, and for years to come." word by word; three cobalt locks latch on 44.4 / 44.9 / 45.4 and stay closed. Held 2 s, out by 46.05.
Audio: latches 44.42 / 44.92 / 45.42.

### Scene 5 — Your turn — 48.54–54.55 s
Logo, "Your turn: say hi." word by word, ⟠ "It's live on Sepolia.", the CTA and pills, the tap and confetti on 52.06, then held still to the end.
Audio: click 52.08, final bell 52.1, music fades under the end card.

**Music mood for this video:** cool, nocturnal, mysterious
**Audio summary:** a quiet, mysterious intro under the chat with soft drops as messages land, the beat dropping in with a glitch as the quantum computer joins, then a steady night-drive groove with clicks where the pq app is touched, latches for the closing locks, and bells on the two payoffs.
