"use client";

import { type ReactNode, useEffect } from "react";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  BanknotesIcon,
  ChevronDownIcon,
  CodeBracketIcon,
  EyeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Avatar } from "~~/components/Avatar";

type Beat = { kicker: string; title: string; lines: string[]; tags?: string[]; visual: ReactNode };

// Two of the friends on the Register card.
const ALICE = "0x01".padEnd(42, "0");
const BOB = "0x05".padEnd(42, "0");

const Hex = ({ children }: { children: ReactNode }) => (
  <code className="rounded-full bg-primary/10 text-primary px-3 py-1 text-sm whitespace-nowrap">{children}</code>
);

const Arrow = () => <ArrowRightIcon className="size-8 opacity-60 rotate-90 sm:rotate-0" />;

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

/** A payment or message on its way, as anyone watching the chain sees it. */
const Public = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed p-5">
    {children}
    <span className="opacity-70">from ? to ?</span>
  </div>
);

const Row = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">{children}</div>
);

/** About a minute, one beat per line of the walkthrough. */
const BEATS: Beat[] = [
  {
    kicker: "Pay",
    title: "Pay anyone privately, with MIST.cash.",
    lines: [
      "MIST.cash keeps who paid whom off the chain.",
      "To collect, your friend just needs the payment's claiming key.",
    ],
    visual: (
      <Row>
        <Person address={ALICE} says="100 USDC 💸" mine />
        <Arrow />
        <Public>
          <b>MIST.cash</b>
          <Hex>100 USDC</Hex>
        </Public>
        <Arrow />
        <Person address={BOB} says="🔑 ?" />
      </Row>
    ),
  },
  {
    kicker: "Hand-off",
    title: "pq passes them the key, privately.",
    lines: [
      "Send the claiming key in a pq message, stored on-chain.",
      "Only your friend can open it, and the chain can't tell it's for them.",
    ],
    visual: (
      <Row>
        <Person address={ALICE} says="🔑 claiming key" mine />
        <Arrow />
        <Public>
          <span className="flex items-center gap-2 opacity-70">
            <EyeIcon className="size-5" /> On-chain, for all to see
          </span>
          <Hex>0x4be1…a07c</Hex>
          <Hex>0x09a7…77e2</Hex>
        </Public>
        <Arrow />
        <Person address={BOB} says="claimed! 🎉" />
      </Row>
    ),
  },
  {
    kicker: "Lasting",
    title: "Private now, and for years to come.",
    lines: [
      "Keys travel with Kyber, a post-quantum scheme, so messages stay private for years.",
      "It all runs in your browser, and your keys never leave it.",
    ],
    tags: ["Kyber512", "zero-knowledge proofs", "Poseidon2"],
    visual: (
      <ol className="relative isolate w-fit mx-auto m-0 p-0 flex gap-6 sm:gap-16">
        <span className="absolute inset-x-8 sm:inset-x-10 top-8 sm:top-10 -z-10 border-t-2 border-dashed" />
        {["today", "in 10 years", "in 20 years"].map(when => (
          <li key={when} className="flex flex-col items-center gap-2">
            <span className="grid place-items-center size-16 sm:size-20 rounded-full bg-primary text-primary-content">
              <LockClosedIcon className="size-8 sm:size-10" />
            </span>
            {when}
          </li>
        ))}
      </ol>
    ),
  },
  {
    kicker: "Try it",
    title: "Your turn: say hi.",
    lines: ["It's live on Sepolia, right at the top of this page.", "Curious how? Turn on 🤿 Deep dive, up top."],
    visual: (
      <div className="flex flex-col items-center gap-8">
        <a href="#top" className="btn btn-primary btn-lg sm:btn-xl rounded-full px-8">
          Say hi 👋 <ArrowUpIcon className="size-5" />
        </a>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { Icon: CodeBracketIcon, name: "GitHub", note: "mistcash/pq", href: "https://github.com/mistcash/pq" },
            { Icon: BanknotesIcon, name: "MIST.cash", note: "private payments", href: "https://mist.cash" },
          ].map(({ Icon, name, note, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-full border-2 bg-base-100 py-2 pl-2 pr-5 text-left leading-tight hover:border-primary transition-colors"
            >
              <Icon className="size-11 rounded-full bg-neutral p-2.5 text-neutral-content" />
              <span>
                <b className="block">{name}</b>
                <span className="text-sm opacity-70">{note}</span>
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

/** The way down from the app to how it works. */
export const HowItWorks = () => (
  <a
    href="#beat-1"
    className="flex items-center gap-2 rounded-full bg-base-100 px-5 py-2.5 font-medium hover:text-primary transition-colors"
  >
    How it works
    <ChevronDownIcon className="size-5 animate-bounce" />
  </a>
);

/** How pq works, under the app: a one-minute walkthrough, one full-screen beat per cue. */
export const Landing = () => (
  <div>
    <ArrowKeys />
    {BEATS.map(({ kicker, title, lines, tags, visual }, i) => (
      <section
        key={kicker}
        id={`beat-${i + 1}`}
        className={`snap-start min-h-[calc(100svh-4rem)] flex flex-col items-center justify-center gap-8 px-4 py-10 text-center ${i % 2 ? "bg-base-200" : "bg-base-100"}`}
      >
        <div className="flex flex-col items-center gap-4 max-w-5xl">
          <span className="font-semibold tracking-wide text-primary">
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
