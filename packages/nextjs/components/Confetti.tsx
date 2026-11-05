import type { CSSProperties } from "react";

/** A one-off burst of MIST-colored confetti from behind the middle of its parent, which should be `relative isolate`. */
export const Confetti = () => (
  <div className="confetti" aria-hidden>
    {Array.from({ length: 14 }, (_, i) => (
      <i key={i} style={{ "--turn": `${i / 14}turn`, "--far": `${7 + (i % 4) * 1.5}rem` } as CSSProperties} />
    ))}
  </div>
);
