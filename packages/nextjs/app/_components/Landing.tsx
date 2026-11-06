"use client";

import { type ReactNode, useEffect } from "react";
import { short } from "./People";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  BoltIcon,
  CheckBadgeIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CodeBracketIcon,
  CpuChipIcon,
  EyeIcon,
  KeyIcon,
  LockClosedIcon,
  LockOpenIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Avatar } from "~~/components/Avatar";

type Beat = { kicker: string; title: string; lines: string[]; tags?: string[]; visual: ReactNode; dark?: boolean };

// Two of the friends on the Register card.
const ALICE = "0x01".padEnd(42, "0");
const BOB = "0x05".padEnd(42, "0");
const FIXED_SENDER = "0xf1".padEnd(42, "0");
const PQMSG = "0xF4a1628850B5C030801002A7e10436699Dd4933C";
const VERIFIER = "0x5184F86dB5c85DB386554F2Cbfe232412741C5d3";

const Hex = ({ children }: { children: ReactNode }) => (
  <code className="rounded-full bg-primary/10 text-primary px-3 py-1 text-sm whitespace-nowrap">{children}</code>
);

const Arrow = ({ label }: { label?: string }) => (
  <div className="flex sm:flex-col items-center gap-2 text-sm opacity-60">
    <ArrowRightIcon className="size-8 rotate-90 sm:rotate-0" />
    {label}
  </div>
);

const Person = ({ address, says, mine }: { address: string; says: string; mine?: boolean }) => (
  <div className="flex sm:flex-col items-center gap-3">
    <Avatar address={address} size={80} />
    <p
      className={`m-0 rounded-3xl px-4 py-2 text-lg ${mine ? "bg-primary text-primary-content" : "bg-base-100 border-2"}`}
    >
      {says}
    </p>
  </div>
);

const Node = ({ name, note, className = "" }: { name: string; note?: string; className?: string }) => (
  <div className={`rounded-2xl border-2 bg-base-100 px-4 py-1.5 leading-tight ${className}`}>
    <p className="m-0 font-semibold sm:text-lg">{name}</p>
    {note && <p className="m-0 text-xs sm:text-sm opacity-70">{note}</p>}
  </div>
);

/** A line down from one key to the next, labelled with how it's derived. */
const Edge = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center font-mono text-xs sm:text-sm text-primary before:h-2 before:w-0.5 before:bg-base-300 after:h-2 after:w-0.5 after:bg-base-300">
    {label}
  </div>
);

const BEATS: Beat[] = [
  {
    kicker: "Public",
    title: "Everything on Ethereum is public, forever.",
    lines: ["Harvest now, decrypt later:", "what's encrypted on-chain today, a future quantum computer can read."],
    visual: (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <figure className="flex flex-col items-center gap-3 m-0">
          <div className="relative isolate flex gap-4">
            <span className="absolute inset-x-4 top-1/2 h-1 -z-10 bg-base-300" />
            {["0x7f3a", "0x91c4", "0x2be0"].map(hex => (
              <div key={hex} className="flex flex-col items-center gap-2 rounded-2xl border-2 bg-base-100 p-3 sm:p-5">
                <LockClosedIcon className="size-6 sm:size-10 text-primary" />
                <code className="text-xs sm:text-base">{hex}…</code>
              </div>
            ))}
          </div>
          <figcaption className="opacity-70">Stored today</figcaption>
        </figure>
        <Arrow label="years later" />
        <figure className="flex flex-col items-center gap-3 m-0">
          <div className="flex items-center gap-3 rounded-3xl bg-neutral text-neutral-content px-5 py-4 sm:py-6 text-xl sm:text-2xl">
            <LockOpenIcon className="size-8 text-warning" />
            “lunch at 1? 🍜”
          </div>
          <figcaption className="opacity-70">Read by a quantum computer</figcaption>
        </figure>
      </div>
    ),
  },
  {
    kicker: "pqmsg",
    title: "pqmsg: tiny private messages, on-chain.",
    lines: [
      "62-byte messages, stored in plain sight.",
      "Only the two ends can read them, and the chain doesn't show who's talking to whom.",
    ],
    tags: ["Kyber512 key exchange", "lattice-based", "Sepolia"],
    visual: (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <Person address={ALICE} says="lunch at 1? 🍜" mine />
        <Arrow />
        <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed p-5">
          <span className="flex items-center gap-2 opacity-70">
            <EyeIcon className="size-5" /> On-chain, for all to see
          </span>
          <Hex>0x4be1…a07c</Hex>
          <Hex>0x09a7…77e2</Hex>
          <span className="opacity-70">from ? to ?</span>
        </div>
        <Arrow />
        <Person address={BOB} says="lunch at 1? 🍜" />
      </div>
    ),
  },
  {
    kicker: "Keys",
    title: "One passkey unlocks everything.",
    lines: [
      "You make a passkey when you join, and every key grows from it.",
      "Nothing to back up beyond the passkey.",
    ],
    tags: ["H = Poseidon2", "User Key = Kyber512"],
    visual: (
      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <Hex>🔑 passkey&apos;s PRF output</Hex>
        <Edge label="H" />
        <Node
          name="Sender Key"
          note="never leaves your browser"
          className="bg-neutral text-neutral-content border-neutral"
        />
        <span className="h-2 w-0.5 bg-base-300" />
        <span className="w-1/2 h-3 border-2 border-b-0 rounded-t-xl" />
        <div className="grid grid-cols-2 w-full">
          <div className="flex flex-col items-center px-1">
            <Edge label="H(·, tag)" />
            <Node name="User Key" note="a Kyber512 key pair" />
            <Edge label="public half" />
            <Hex>on-chain</Hex>
          </div>
          <div className="flex flex-col items-center px-1">
            <Edge label="H(·, their User Index)" />
            <Node name="Channel Key" note="one per recipient" />
            <Edge label="H(·, Message Index)" />
            <Node name="Message Key" note="one per message" />
            <span className="h-3 w-0.5 bg-base-300" />
            <div className="flex flex-wrap justify-center gap-1">
              {["Message ID", "pad", "pad"].map((name, i) => (
                <Node key={i} name={name} note={`H(·, ${i})`} className="px-2!" />
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    kicker: "Channels",
    title: "Saying hi hides the key inside a lattice.",
    lines: [
      "Your Channel Key is locked to their User Key, with a zero-knowledge proof.",
      "The chain never learns who it's for: they find it by trying every Channel.",
    ],
    tags: ["Kyber512", "Groth16 on BN254", "the User Key is a private input"],
    visual: (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <Person address={ALICE} says="hi 👋" mine />
        <Arrow />
        <div className="flex flex-col gap-3 rounded-3xl border-2 bg-base-100 p-5 text-left">
          <span className="flex items-center justify-between gap-4">
            Channel Key Hash <Hex>0x1f9c…</Hex>
          </span>
          <span>
            Encrypted Channel Key <span className="text-sm opacity-60">· 37 field elements</span>
            <span className="grid grid-cols-[repeat(13,auto)] gap-1 w-fit mt-2">
              {Array.from({ length: 37 }, (_, i) => (
                <i key={i} className="size-3 rounded-sm bg-primary" style={{ opacity: (((i * 5) % 7) + 3) / 10 }} />
              ))}
            </span>
          </span>
          <span className="flex items-center justify-between gap-4">
            Encrypted Sender <Hex>0x8d02…</Hex>
          </span>
          <span className="flex items-center gap-2 rounded-full bg-success px-3 py-1">
            <ShieldCheckIcon className="size-5" /> Proof checks out. To: ?
          </span>
        </div>
        <Arrow />
        <div className="flex sm:flex-col items-center gap-3">
          <Avatar address={BOB} size={80} />
          <ul className="flex flex-col gap-1 m-0 p-0 text-left">
            {[1, 2, 3].map(n => (
              <li
                key={n}
                className={`flex items-center gap-2 rounded-full px-3 py-1 ${n === 3 ? "bg-success" : "bg-base-100 opacity-60"}`}
              >
                {n === 3 ? <CheckIcon className="size-5" /> : <XMarkIcon className="size-5" />} Channel {n}
                {n === 3 && <Avatar address={ALICE} size={24} />}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    kicker: "Messages",
    title: "Messages: hash and add.",
    lines: [
      "Each half of your message gets a secret pad added, then goes on-chain.",
      "A Fixed Sender posts it, so your address isn't on it.",
    ],
    tags: ["2 × 31 bytes", "pad n = H(Message Key, n)", "Message ID = H(Message Key, 0)"],
    visual: (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <div className="grid grid-cols-[repeat(5,auto)] items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          {[
            ["lunch at 1?", "0x5c1e…"],
            ["my treat 🍜", "0x83fa…"],
          ].map(([half, element], i) => (
            <div key={half} className="contents">
              <span className="rounded-3xl bg-primary text-primary-content px-4 py-2">{half}</span>+
              <span className="rounded-full border-2 border-dashed px-3 py-1">pad {i + 1}</span>=<Hex>{element}</Hex>
            </div>
          ))}
        </div>
        <Arrow />
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 bg-base-100 p-5">
          <span>
            stored under <Hex>Message ID 0x3e07…</Hex>
          </span>
          <span className="flex items-center gap-2 opacity-70">
            posted by <Avatar address={FIXED_SENDER} size={32} /> the Fixed Sender
          </span>
        </div>
      </div>
    ),
  },
  {
    kicker: "Prover",
    title: "The proof is made in your browser, on your GPU.",
    lines: ["No server ever sees your keys.", "No GPU? The CPU takes over, in about 8 s."],
    tags: ["Go → WASM", "Web Worker", "gnark's WebGPU bridge"],
    visual: (
      <div className="mx-auto max-w-3xl rounded-3xl border-2 bg-base-100 text-left overflow-hidden">
        <div className="flex items-center gap-2 border-b-2 px-5 py-3">
          {[1, 2, 3].map(n => (
            <span key={n} className="size-3 rounded-full bg-base-300" />
          ))}
          <span className="ml-2 text-sm opacity-60">pqmsg</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6">
          <Node name="Page" note="starts the prover on load" />
          <Arrow />
          <Node name="Web Worker" note="Go prover, as WASM" />
          <Arrow />
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2 rounded-2xl bg-primary text-primary-content px-4 py-2">
              <BoltIcon className="size-6" /> GPU <span className="text-sm opacity-80">MSMs + NTT</span>
            </span>
            <span className="flex items-center gap-2 rounded-2xl bg-base-200 px-4 py-2">
              <CpuChipIcon className="size-6" /> CPU <span className="text-sm opacity-70">fallback, ~8 s</span>
            </span>
          </div>
        </div>
        <p className="m-0 border-t-2 px-5 py-3 text-sm opacity-70">
          Back to the CPU when there&apos;s no WebGPU, GPU setup takes over 10 s, or a GPU proof fails.
        </p>
      </div>
    ),
  },
  {
    kicker: "Demo",
    title: "Let's watch it prove, live.",
    lines: ["Open DevTools, say hi, and catch the worker at work."],
    visual: (
      <ol className="mx-auto max-w-xl m-0 flex flex-col gap-3 rounded-3xl border-2 bg-base-200 p-6 sm:p-8 text-left sm:text-xl">
        {[
          <>
            Open DevTools <kbd className="kbd kbd-sm">F12</kbd>
          </>,
          <>
            Console: <Hex>pqmsg prover on the GPU</Hex> <span className="opacity-60">(or CPU)</span>
          </>,
          <>Performance → Record</>,
          <>Pick someone, tap “Say hi 👋”</>,
          <>
            The worker track: <Hex>pqmsg load</Hex> <Hex>pqmsg prove</Hex>
          </>,
        ].map((step, i) => (
          <li key={i}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="checkbox checkbox-primary" />
              <span className="leading-9">{step}</span>
            </label>
          </li>
        ))}
      </ol>
    ),
  },
  {
    kicker: "Edges",
    title: "Honest about the edges.",
    lines: ["Post-quantum where it counts today, and clear about where it isn't yet."],
    tags: [
      "Channel Keys cached in browser storage",
      "no message authentication tag",
      "single-party Groth16 setup, dev only",
      "no forward secrecy",
      "testnet prototype, not audited",
    ],
    dark: true,
    visual: (
      <div className="grid sm:grid-cols-2 gap-4 text-left">
        {[
          {
            Icon: ShieldCheckIcon,
            heading: "Post-quantum today",
            color: "text-success border-success/40",
            items: [
              ["The key exchange", "Kyber512, built on lattices."],
              ["Every hash and pad", "Poseidon2."],
            ],
          },
          {
            Icon: ClockIcon,
            heading: "Not yet",
            color: "text-warning border-warning/40",
            items: [
              [
                "Proof soundness",
                "A quantum attacker could forge Groth16 Channel openings. That breaks integrity only: the proof still hides the recipient.",
              ],
              [
                "The Sender Key",
                "It comes from an ECDSA wallet signature, so whoever recovers the wallet key from its public key can re-derive it.",
              ],
            ],
          },
        ].map(({ Icon, heading, color, items }) => (
          <div key={heading} className={`flex flex-col gap-4 rounded-3xl border-2 bg-white/5 p-6 ${color}`}>
            <h3 className="flex items-center gap-2 text-2xl font-semibold m-0">
              <Icon className="size-7" /> {heading}
            </h3>
            {items.map(([name, note]) => (
              <p key={name} className="m-0 text-neutral-content sm:text-lg">
                <b className="block">{name}</b>
                <span className="opacity-70">{note}</span>
              </p>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    kicker: "Next",
    title: "What's next.",
    lines: ["Closing the edges, one by one."],
    visual: (
      <ol className="relative isolate m-0 p-0 grid grid-cols-2 sm:grid-cols-5 gap-x-3 gap-y-6">
        <span className="hidden sm:block absolute inset-x-[10%] top-10 -z-10 border-t-2 border-dashed" />
        {(
          [
            [KeyIcon, "A post-quantum root secret", "so the Sender Key stops resting on ECDSA"],
            [LockClosedIcon, "ML-KEM", "the standardized Kyber"],
            [UserGroupIcon, "A multi-party setup ceremony", "no single trusted party"],
            [CheckBadgeIcon, "Message authentication", "so tampering shows"],
            [PaperAirplaneIcon, "A real relayer", "in place of the Fixed Sender"],
          ] as const
        ).map(([Icon, name, note]) => (
          <li key={name} className="flex flex-col items-center gap-2 last:col-span-2 sm:last:col-span-1">
            <span className="grid place-items-center size-16 sm:size-20 rounded-full bg-primary text-primary-content">
              <Icon className="size-8 sm:size-10" />
            </span>
            <b className="sm:text-lg leading-tight">{name}</b>
            <span className="text-sm sm:text-base opacity-70">{note}</span>
          </li>
        ))}
      </ol>
    ),
  },
  {
    kicker: "Try it",
    title: "Your turn: say hi.",
    lines: ["It's live on Sepolia, right at the top of this page."],
    visual: (
      <div className="flex flex-col items-center gap-8">
        <a href="#top" className="btn btn-primary btn-lg sm:btn-xl rounded-full px-8">
          Say hi 👋 <ArrowUpIcon className="size-5" />
        </a>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { name: "GitHub", note: "mistcash/pqmsg", href: "https://github.com/mistcash/pqmsg" },
            { name: "PqMsg", address: PQMSG },
            { name: "Verifier", address: VERIFIER },
          ].map(({ name, note, href, address }) => (
            <a
              key={name}
              href={href ?? `https://sepolia.etherscan.io/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-full border-2 bg-base-100 py-2 pl-2 pr-5 text-left leading-tight hover:border-primary transition-colors"
            >
              {address ? (
                <Avatar address={address} size={44} />
              ) : (
                <CodeBracketIcon className="size-11 rounded-full bg-neutral p-2.5 text-neutral-content" />
              )}
              <span>
                <b className="block">{name}</b>
                <span className="text-sm opacity-70">{note ?? short(address!)}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    ),
  },
];

const STEPS: Record<string, boolean> = { ArrowDown: true, ArrowRight: true, ArrowUp: false, ArrowLeft: false };

const hop = (e: KeyboardEvent) => {
  const down = STEPS[e.key];
  const typing = (e.target as Element).matches("input:not([type=checkbox]), textarea, select, [contenteditable]");
  if (down === undefined || typing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const beats = [...document.querySelectorAll("section[id^=beat-]")];
  // Below the sticky header.
  const top = (beat: Element) => beat.getBoundingClientRect().top - 64;
  const to = down ? beats.find(b => top(b) > 1 && top(b) < innerHeight) : beats.findLast(b => top(b) < -1);
  if (!to) return;
  e.preventDefault();
  to.scrollIntoView();
};

/**
 * Snapping by proximity only nudges the page on arrow keys, so they hop to the next beat once it's in view, or back
 * to the start of this beat or the last. Right and left too, as many presentation clickers send them.
 */
const ArrowKeys = () => {
  useEffect(() => {
    addEventListener("keydown", hop);
    return () => removeEventListener("keydown", hop);
  }, []);
  return null;
};

/** How pqmsg works, under the app: one full-screen beat per cue of the talk. */
export const Landing = () => (
  <div>
    <ArrowKeys />
    <a
      href="#beat-1"
      className="flex flex-col items-center w-fit mx-auto pb-8 text-base-content/60 hover:text-primary transition-colors"
    >
      How it works
      <ChevronDownIcon className="size-6 animate-bounce" />
    </a>
    {BEATS.map(({ kicker, title, lines, tags, visual, dark }, i) => (
      <section
        key={kicker}
        id={`beat-${i + 1}`}
        className={`snap-start min-h-[calc(100svh-4rem)] flex flex-col items-center justify-center gap-8 px-4 py-10 text-center ${dark ? "bg-neutral text-neutral-content" : i % 2 ? "bg-base-200" : "bg-base-100"}`}
      >
        <div className="flex flex-col items-center gap-4 max-w-5xl">
          <span className={`font-semibold tracking-wide ${dark ? "text-success" : "text-primary"}`}>
            {String(i + 1).padStart(2, "0")} · {kicker}
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-balance m-0">{title}</h2>
          <p className="text-lg sm:text-2xl opacity-70 text-balance m-0">
            {lines.map(line => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
        <div className="w-full max-w-5xl motion-safe:animate-pop motion-safe:[animation-timeline:view()] motion-safe:[animation-range:entry_0%_entry_40%]">
          {visual}
        </div>
        {tags && (
          <ul className="flex flex-wrap justify-center gap-2">
            {tags.map(tag => (
              <li key={tag} className="rounded-full border border-current/20 px-3 py-1 text-sm opacity-70">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </section>
    ))}
  </div>
);
