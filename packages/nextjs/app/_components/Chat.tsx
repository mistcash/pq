"use client";

import { Messages } from "./Messages";
import { short } from "./People";
import type { Address } from "viem";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Avatar } from "~~/components/Avatar";
import { Confetti } from "~~/components/Confetti";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth";
import type { Joining } from "~~/hooks/useJoinChannel";
import { type OpenStep, useOpenChannel } from "~~/hooks/useOpenChannel";
import { joinLink, loadChannelKey } from "~~/utils/channels";

export const PROGRESS: Record<Exclude<OpenStep, "open">, string> = {
  start: "Getting ready…",
  sign: "Sign in your wallet to unlock your secret key.",
  check: "Once more, so we know your wallet always signs the same way.",
  prove: "Doing some secret math, right here in your browser…",
  send: "Sending it off. The gas is on us.",
  confirm: "Waiting for the chain to say yes…",
};

type Props = { me: Address; other: Address; joining?: Joining; onBack: () => void };

/** You and another User: what they said on their Channel to you, and what you say on yours, once you've said hi. */
export const Chat = ({ me, other, joining, onBack }: Props) => {
  const { step, error, open } = useOpenChannel();
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();
  const canShare = "share" in navigator;
  const yours = loadChannelKey(me, other);
  const theirs = loadChannelKey(other, me);
  const busy =
    !error && step && step !== "open"
      ? PROGRESS[step]
      : joining && !joining.joined && !joining.error && "Unlocking your chat…";
  const celebrate = step === "open" ? "You're connected!" : joining?.joined && "You're in!";

  const share = () => {
    const url = joinLink(me, yours!);
    if (canShare) navigator.share({ url }).catch(() => undefined);
    else copyToClipboard(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <button className="btn btn-ghost btn-lg self-start -ml-3 px-3" onClick={onBack}>
        <ArrowLeftIcon className="h-5 w-5" /> People
      </button>
      <div className="flex flex-col items-center text-center gap-3">
        <div className={`relative isolate ${busy ? "animate-bounce" : ""}`}>
          {celebrate && <Confetti key={celebrate} />}
          <Avatar address={other} size={128} />
        </div>
        <h1 className="text-3xl font-bold m-0">{short(other)}</h1>
      </div>
      <div className="card bg-base-100 border border-base-300 p-6 items-center text-center gap-4">
        {busy ? (
          <>
            <span className="loading loading-dots loading-lg text-primary" />
            <p className="m-0">{busy}</p>
          </>
        ) : (
          <>
            {celebrate && <h2 className="text-2xl font-bold m-0">{celebrate}</h2>}
            <p className="text-base-content/70 m-0">
              {error ??
                joining?.error ??
                (yours
                  ? "Send them this link once so they can read what you write."
                  : "Only they can read what you write.")}
            </p>
            {yours ? (
              <button className="btn btn-primary btn-lg btn-block" onClick={share}>
                {isCopiedToClipboard ? "Copied!" : canShare ? "Share link" : "Copy link"}
              </button>
            ) : (
              <button className="btn btn-primary btn-lg btn-block" onClick={() => open(me, other)}>
                Say hi 👋
              </button>
            )}
          </>
        )}
      </div>
      {theirs && <Messages channelKey={theirs} />}
      {yours && <Messages channelKey={yours} mine />}
    </div>
  );
};
