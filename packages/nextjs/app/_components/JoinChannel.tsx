"use client";

import { Messages } from "./Messages";
import { short } from "./People";
import type { Address } from "viem";
import { ArrowLeftIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { Avatar } from "~~/components/Avatar";
import { Confetti } from "~~/components/Confetti";
import type { Joining } from "~~/hooks/useJoinChannel";
import { loadChannelKey } from "~~/utils/channels";

type Props = Joining & { me: Address; onBack: () => void; onReply: () => void };

/** The Channel someone opened to you, as you join it, then what they said. */
export const JoinChannel = ({ me, from, joined, error, onBack, onReply }: Props) => (
  <div className="flex flex-col gap-6">
    <button className="btn btn-ghost btn-sm self-start" onClick={onBack}>
      <ArrowLeftIcon className="h-4 w-4" /> People
    </button>
    <div className="flex flex-col items-center text-center gap-3">
      <div className={`relative isolate ${joined || error ? "" : "animate-bounce"}`}>
        {joined && <Confetti />}
        <Avatar address={from} size={128} />
      </div>
      <h1 className="text-3xl font-bold m-0">{short(from)}</h1>
    </div>
    <div className="card bg-base-100 border border-base-300 p-6 items-center text-center gap-4">
      {error ? (
        <p className="m-0">{error}</p>
      ) : joined ? (
        <>
          <h2 className="text-2xl font-bold m-0">You&apos;re in!</h2>
          <p className="text-base-content/70 m-0">Whatever they send you will pop up right here.</p>
        </>
      ) : (
        <>
          <span className="loading loading-dots loading-lg text-primary" />
          <p className="m-0">Unlocking your chat…</p>
        </>
      )}
    </div>
    {joined && <Messages channelKey={loadChannelKey(from, me)!} />}
    {joined && (
      <button className="btn btn-primary btn-lg btn-block" onClick={onReply}>
        <ArrowUturnLeftIcon className="h-5 w-5" /> Reply
      </button>
    )}
  </div>
);
