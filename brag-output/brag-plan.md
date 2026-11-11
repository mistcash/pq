# pq — brag plan

## The answers

- **What is it?** pq is private messaging on Ethereum: every message is stored publicly on-chain, yet only the two ends of a conversation can read it, and it stays private against quantum computers.
- **Who is it for?** People sending private payments (MIST.cash) who need to hand their friend the claiming key, and anyone coordinating peer-to-peer on a public chain.
- **What sets it apart?** Kyber512 (post-quantum) key exchange plus a zero-knowledge proof made in your browser, and the chain can't see who's talking. No "harvest now, decrypt later" expiry date.
- **Most impressive / funniest claim:** "Doing some secret math, right here in your browser…" (it's a 49,223-constraint Groth16 proof) and "Private now, and for years to come."
- **Visual hook:** an ink-dark wall of on-chain ciphertext with the app's own dashed "On-chain, for all to see / from ? to ?" card, then it decrypts into a friendly chat.
- **Real UI to show:** the Landing's hand-off row (avatars, dashed Public card, hex pills), the Chat screen's Say hi → secret math → confetti "You're connected!", the Messages composer with its 62-byte countdown, the Landing's three locks, the "Your turn: say hi." CTA.
- **Tone:** `default`, leaning on the app's own brief: "very playful and polished", MIST.cash colors.
- **Share caption:** "Every message public on-chain. Only the two of you can read it, even after quantum computers show up."

## Angle

**Public, forever — and still private.** Open on the scary truth (a public chain keeps everything), flip it with one decrypt, then show the real app making it happen with its own cheerful copy.

## Visual identity (from `styles/globals.css`, `Avatar.tsx`, `logo.svg`)

- Fredoka (the app's font), weights 400–700.
- Cobalt `#0052FF`, Baby `#E3EDF5`, Ink `#081019`, Misty `#ACC4D6`, white; warning `#FFCF72` in confetti.
- DaisyUI 5 + Tailwind 4 with the app's light theme tokens and radii (field 1rem, box 1.5rem, selector 2rem). Component markup lifted from the JSX.
- Keccak-generated creature avatars, the app's real `Avatar` algorithm, ported to plain JS.
- The app's `pop` easing `cubic-bezier(0.3, 1.6, 0.6, 1)` and confetti burst.

Stand-ins: the chat partner's address is fictional (`0x7a3F…9c2E` style); avatars use the Landing's own ALICE/BOB constants. No real user data.

## Format

Landscape 1920×1080, 30 fps, 22.0 s (660 frames).

## Music

120 BPM, 4/4, D major. Beat = 0.5 s, bar = 2 s, counted from frame 0. Every cut lands on a beat.

| Bar | Time | Chord | Arrangement |
|---|---|---|---|
| 0 | 0–2 | Bm (filtered) | Hook: dark muffled pad, quiet ticking 16th hats like data, sub pulse on beats, reverse swell into 2.0 |
| 1 | 2–4 | D | Reveal: bright chord hit + sparkle; kick, bass, pluck melody enter |
| 2 | 4–6 | A | groove |
| 3 | 6–8 | Bm | groove |
| 4 | 8–10 | G | groove; soft tap on 9.0 |
| 5 | 10–12 | D | busier 16th arpeggio ("secret math") |
| 6 | 12–14 | A | confetti chime on the downbeat 12.0 |
| 7 | 14–16 | Bm | tap 14.5, confetti sparkle 14.5 |
| 8 | 16–18 | G | lock plucks D5 16.0, F#5 16.5, A5 17.0 |
| 9 | 18–20 | A (sus4 → A) | build, pickup into 20.0 |
| 10 | 20–22 | D | final resolving hit 20.0, rings out, fade 21.3–22.0 |

## Storyboard

| # | Time | Scene | On screen | Readable text (hold) | SFX |
|---|---|---|---|---|---|
| 1 | 0.0–2.0 | **Hook** | Ink background, drifting columns of cobalt/misty hex. The Landing's dashed Public card pops in center: 👁 On-chain, for all to see · `0x4be1…a07c` · `0x09a7…77e2` · from ? to ? | "Public." (0.25) "Forever." (0.75) → held to 2.0 | data ticks; whoosh-pop at 0.0 |
| 2 | 2.0–5.0 | **Reveal** | Circle wipe from the card to Baby blue. The hex pills scramble and resolve; ALICE slides in left with a cobalt "🔑 claiming key" bubble, BOB right with "got the key! 🎉" (Landing beat 2 "Hand-off" row) | "Only the two of you can read it." settled 2.35 → 2.65 s | decrypt shimmer 2.0, pop 2.5, pop 3.0 |
| 3 | 5.0–8.5 | **Title** | pq logo tile (white rim) left; real tagline right; Register card perks pop one per beat: 🔒 Post-quantum · 🌍 On Ethereum · 🙈 The chain can't see who's talking | "Scalable, post-quantum cryptographic messaging for private payments and peer coordination." settled 5.25 → 3.25 s | pop on 5.0, soft ticks on chips |
| 4 | 8.5–13.0 | **Say hi** | App column (Chat screen) slides in right: "← People", partner avatar, card "Only they can read what you write." + **Say hi 👋**. Cursor taps at 9.0 → avatar bounces, loading dots, progress line. 12.0 confetti + "You're connected!" Left: kicker "Say hi" + chips Kyber512 · zero-knowledge proof | "Doing some secret math, right here in your browser…" 9.1–12.0 (2.9 s); "You're connected!" 12.0–13.0 | tap 9.0; arpeggio; confetti chime 12.0 |
| 5 | 13.0–16.0 | **Send** | Same app column scrolls to "You said" card: composer types "here's the claiming key 🔑", counter counts down from 62, tap send 14.5 → confetti, bubble pops in with "See it on Etherscan" | Left: "🙈 The chain can't see who's talking." settled 13.3 → 2.7 s | key ticks (soft), tap + sparkle 14.5 |
| 6 | 16.0–19.0 | **Lasting** | Landing beat 3: "03 · Lasting", three cobalt lock circles pop on beats with the dashed line; tags Kyber512 · zero-knowledge proofs · Poseidon2 | "Private now, and for years to come." settled 16.3 → 2.7 s | rising plucks 16.0 / 16.5 / 17.0 |
| 7 | 19.0–22.0 | **Outro** | Landing beat 4: logo, "Your turn: say hi.", **Say hi 👋** button pressed on 20.0, GitHub mistcash/pq + MIST.cash pills, "Live on Sepolia" | "Your turn: say hi." settled 19.3 → 2.7 s | final chord 20.0, fade out |

Transitions: 1→2 circle wipe anchored on the card (the card persists, no double exposure). 2→3 old out on 4.75–5.0, new in from 5.0. 3→4 slide. 4→5 continuous in-app scroll. 5→6 and 6→7 old out, then new in.

Poster: scene 4's "You're connected!" or scene 2's decrypted hand-off row.
