"use client";

import { useState } from "react";
import { PROGRESS } from "./Chat";
import type { Address } from "viem";
import { ArrowPathIcon, CheckIcon } from "@heroicons/react/24/outline";
import type { useOpenChannel } from "~~/hooks/useOpenChannel";
import { friendlyMessage } from "~~/utils/friendly";
import { notification } from "~~/utils/scaffold-eth";

type Props = { me: Address } & Pick<ReturnType<typeof useOpenChannel>, "step" | "restored" | "restore">;

/** Brings back the chats you started with one signature. Ones you received come back through their links. */
export const Restore = ({ me, step, restored, restore }: Props) => {
  const [restoring, setRestoring] = useState(false);

  const tap = async () => {
    setRestoring(true);
    try {
      await restore(me);
    } catch (e) {
      notification.error(friendlyMessage(e));
    }
    setRestoring(false);
  };

  return (
    <div className="flex flex-col items-center text-center gap-2 mt-6">
      <span className="text-base-content/70">
        {restoring && step !== "open" ? PROGRESS[step ?? "start"] : "New phone or browser?"}
      </span>
      {restored === undefined ? (
        <button className="btn btn-soft btn-primary btn-lg btn-block rounded-full" disabled={restoring} onClick={tap}>
          {restoring ? <span className="loading loading-dots" /> : <ArrowPathIcon className="h-5 w-5" />}
          Bring back my chats
        </button>
      ) : (
        <>
          {/* The result takes the button's place, so Restore keeps the same shape as Paste. */}
          <p role="status" className="btn btn-soft btn-primary btn-lg btn-block rounded-full pointer-events-none m-0">
            {!!restored && <CheckIcon className="h-5 w-5" />}
            {restored ? `Found ${restored} chat${restored === 1 ? "" : "s"} you started!` : "No chats you started yet."}
          </p>
          <span className="text-sm text-base-content/70">
            Chats others started with you come back when you open their links again.
          </span>
        </>
      )}
    </div>
  );
};
