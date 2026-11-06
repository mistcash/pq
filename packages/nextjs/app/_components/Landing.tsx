import type { ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type Beat = { kicker: string; title: string; lines: string[]; tags?: string[]; visual: ReactNode; dark?: boolean };

const BEATS: Beat[] = [];

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
          {lines.map(line => (
            <p key={line} className="text-lg sm:text-2xl opacity-70 text-balance m-0">
              {line}
            </p>
          ))}
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
