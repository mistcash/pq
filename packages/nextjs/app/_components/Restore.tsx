"use client";

import { useState } from "react";
import { PROGRESS } from "./Chat";
import type { Address } from "viem";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { useOpenChannel } from "~~/hooks/useOpenChannel";
import { friendlyMessage } from "~~/utils/friendly";
import { notification } from "~~/utils/scaffold-eth";

type Props = { me: Address } & Pick<ReturnType<typeof useOpenChannel>, "step" | "restored" | "restore">;

/** Finds every chat started by you or with you, with one passkey tap. Tap again to check for new ones. */
export const Restore = ({ me, step, restored, restore }: Props) => {
  const [restoring, setRestoring] = useState(false);

  const bringBackChats = async () => {
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
      <span role="status" className="text-base-content/70">
        {restoring && step !== "open"
          ? PROGRESS[step ?? "start"]
          : restored === undefined
            ? "New phone, or did someone say hi?"
            : restored
              ? `Found ${restored} chat${restored === 1 ? "" : "s"}!`
              : "No chats yet."}
      </span>
      <button
        className="btn btn-soft btn-primary btn-lg btn-block rounded-full"
        disabled={restoring}
        onClick={bringBackChats}
      >
        {restoring ? <span className="loading loading-dots" /> : <ArrowPathIcon className="h-5 w-5" />}
        Find my chats
      </button>
    </div>
  );
};
