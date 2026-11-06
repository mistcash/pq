"use client";

import type { AvatarComponent } from "@rainbow-me/rainbowkit";
import { type Hex, hexToBytes, keccak256 } from "viem";

const COBALT = "#0052FF";
const BABY = "#E3EDF5";
const INK = "#081019";
const MISTY = "#ACC4D6";
const WHITE = "#FFFFFF";

// [background, body, face]
const THEMES = [
  [COBALT, WHITE, INK],
  [BABY, COBALT, WHITE],
  [MISTY, INK, WHITE],
  [INK, COBALT, WHITE],
  [MISTY, COBALT, WHITE],
  [BABY, INK, WHITE],
  [COBALT, MISTY, INK],
  [INK, BABY, INK],
];

const pick = <T,>(n: number, ...options: T[]) => options[n % options.length];

/** A little creature drawn from keccak256(address), so an address looks the same everywhere. */
export const Avatar: AvatarComponent = ({ address, size }) => {
  const [theme, shape, eyes, mouth, extra, px, py, tilt] = hexToBytes(keccak256(address as Hex));
  const [bg, body, face] = pick(theme, ...THEMES);
  const pupil = { fill: body, transform: `translate(${((px % 3) - 1) * 2} ${((py % 3) - 1) * 2})` };
  const line = { fill: "none", stroke: face, strokeWidth: 3, strokeLinecap: "round" } as const;

  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="shrink-0 rounded-full" aria-hidden>
      <rect width="64" height="64" fill={bg} />
      <g transform={`rotate(${((tilt % 5) - 2) * 6} 32 40)`}>
        <g fill={body}>
          {pick(
            extra,
            null,
            <>
              <path d="M32 20V7" stroke={body} strokeWidth="3" />
              <circle cx="32" cy="7" r="4" />
            </>,
            <>
              <circle cx="15" cy="20" r="8" />
              <circle cx="49" cy="20" r="8" />
            </>,
            <path d="M19 27 15 8l13 11zM45 27l4-19-13 11z" />,
          )}
          {pick(
            shape,
            <circle cx="32" cy="38" r="22" />,
            <rect x="11" y="16" width="42" height="52" rx="16" />,
            <path d="M12 66V36a20 20 0 0 1 40 0v30z" />,
            <rect x="14" y="20" width="36" height="36" rx="10" transform="rotate(45 32 38)" />,
          )}
        </g>
        {pick(
          eyes,
          <g fill={face}>
            <circle cx="24" cy="33" r="3.5" />
            <circle cx="40" cy="33" r="3.5" />
          </g>,
          <>
            <circle cx="24" cy="32" r="6.5" fill={face} />
            <circle cx="40" cy="32" r="6.5" fill={face} />
            <g {...pupil}>
              <circle cx="24" cy="32" r="3" />
              <circle cx="40" cy="32" r="3" />
            </g>
          </>,
          <>
            <circle cx="32" cy="31" r="9" fill={face} />
            <circle cx="32" cy="31" r="4" {...pupil} />
          </>,
          <path d="M19 34q5-7 10 0M35 34q5-7 10 0" {...line} />,
        )}
        {pick(
          mouth,
          <path d="M25 44q7 7 14 0" {...line} />,
          <circle cx="32" cy="46" r="3.5" fill={face} />,
          <path d="M24 43h16a8 8 0 0 1-16 0z" fill={face} />,
          <path d="M24 46q4-4 8 0t8 0" {...line} />,
        )}
      </g>
      {/* A white rim, so a pale avatar still stands out on the pale page. */}
      <circle cx="32" cy="32" r="31.5" fill="none" stroke={WHITE} strokeWidth="2" />
    </svg>
  );
};
