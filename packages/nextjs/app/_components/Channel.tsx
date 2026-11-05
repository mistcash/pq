"use client";

import { short } from "./People";
import type { Address } from "viem";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Avatar } from "~~/components/Avatar";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth";
import type { OpenStep, useOpenChannel } from "~~/hooks/useOpenChannel";
import { joinLink, loadChannelKey } from "~~/utils/channels";

const PROGRESS: Record<Exclude<OpenStep, "open">, string> = {
  start: "Getting ready…",
  sign: "Sign in your wallet to unlock your secret key.",
  check: "Once more, so we know your wallet always signs the same way.",
  prove: "Doing some secret math, right here in your browser…",
  send: "Sending it off. The gas is on us.",
  confirm: "Waiting for the chain to say yes…",
};

type Props = { me: Address; other: Address; onBack: () => void } & ReturnType<typeof useOpenChannel>;

/** A Channel with another User: opening it, then sharing the join link. */
export const Channel = ({ me, other, onBack, step, error, open }: Props) => {
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();
  const canShare = "share" in navigator;

  const share = () => {
    const url = joinLink(me, loadChannelKey(me, other)!);
    if (canShare) navigator.share({ url }).catch(() => undefined);
    else copyToClipboard(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <button className="btn btn-ghost btn-sm self-start" onClick={onBack}>
        <ArrowLeftIcon className="h-4 w-4" /> People
      </button>
      <div className="flex flex-col items-center text-center gap-3">
        <div className={step === "open" || error ? "" : "animate-bounce"}>
          <Avatar address={other} size={128} />
        </div>
        <h1 className="text-3xl font-bold m-0">{short(other)}</h1>
      </div>
      <div className="card bg-base-100 border border-base-300 p-6 items-center text-center gap-4">
        {error ? (
          <>
            <p className="m-0">{error}</p>
            <button className="btn btn-primary btn-lg btn-block" onClick={() => open(me, other)}>
              Try again
            </button>
          </>
        ) : step === "open" ? (
          <>
            <h2 className="text-2xl font-bold m-0">You&apos;re connected!</h2>
            <p className="text-base-content/70 m-0">Send them this link once so they can read what you write.</p>
            <button className="btn btn-primary btn-lg btn-block" onClick={share}>
              {isCopiedToClipboard ? "Copied!" : canShare ? "Share link" : "Copy link"}
            </button>
          </>
        ) : (
          <>
            <span className="loading loading-dots loading-lg text-primary" />
            <p className="m-0">{step && PROGRESS[step]}</p>
          </>
        )}
      </div>
    </div>
  );
};
