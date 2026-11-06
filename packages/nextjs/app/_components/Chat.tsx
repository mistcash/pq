"use client";

import { Messages } from "./Messages";
import { short } from "./People";
import type { Address } from "viem";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Avatar } from "~~/components/Avatar";
import { Confetti } from "~~/components/Confetti";
import { TxLink } from "~~/components/TxLink";
import { type OpenStep, useOpenChannel } from "~~/hooks/useOpenChannel";
import { loadChannelKey } from "~~/utils/channels";

export const PROGRESS: Record<Exclude<OpenStep, "open">, string> = {
  start: "Getting ready…",
  sign: "Sign in your wallet to unlock your secret key.",
  check: "Once more, so we know your wallet always signs the same way.",
  prove: "Doing some secret math, right here in your browser…",
  send: "Sending it off. It's free!",
  confirm: "Almost there, making sure it landed…",
};

type Props = { me: Address; other: Address; onBack: () => void };

/** You and another User: what they said on their Channel to you, and what you say on yours, once you've said hi. */
export const Chat = ({ me, other, onBack }: Props) => {
  const { step, error, open, tx } = useOpenChannel();
  const yours = loadChannelKey(me, other);
  const theirs = loadChannelKey(other, me);
  const busy = !error && step && step !== "open" && PROGRESS[step];
  const celebrate = step === "open" && "You're connected!";

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
                (yours
                  ? "They'll find your chat when they tap “Find my chats”."
                  : "Only they can read what you write.")}
            </p>
            <TxLink hash={tx} />
            {!yours && (
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
