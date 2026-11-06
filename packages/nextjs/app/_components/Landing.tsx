import type { ReactNode } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Avatar } from "~~/components/Avatar";

type Beat = { kicker: string; title: string; lines: string[]; tags?: string[]; visual: ReactNode; dark?: boolean };

// Two of the friends on the Register card.
const ALICE = "0x01".padEnd(42, "0");
const BOB = "0x05".padEnd(42, "0");

const Hex = ({ children }: { children: ReactNode }) => (
  <code className="rounded-full bg-primary/10 text-primary px-3 py-1 text-sm">{children}</code>
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
      "Only the two ends can read them, and nobody sees who's talking to whom.",
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
    title: "One signature unlocks everything.",
    lines: [
      "Your wallet signs one fixed message, and every key grows from it.",
      "Nothing to back up beyond the wallet.",
    ],
    tags: ["H = Poseidon2", "User Key = Kyber512"],
    visual: (
      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <Hex>✍️ wallet signature</Hex>
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
];

/** How pqmsg works, under the app: one full-screen beat per cue of the talk. */
export const Landing = () => (
  <div>
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
        <div className="flex flex-col items-center gap-4 max-w-4xl">
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
        <div className="w-full max-w-5xl">{visual}</div>
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
