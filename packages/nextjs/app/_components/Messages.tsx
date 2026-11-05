"use client";

import type { Hex } from "viem";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useMessages } from "~~/hooks/useMessages";

/** A Channel's messages in order, with a refresh button. Your own sit on the right. */
export const Messages = ({ channelKey, mine }: { channelKey: Hex; mine?: boolean }) => {
  const { messages, refresh, refreshing } = useMessages(channelKey);

  return (
    <div className="card bg-base-100 border border-base-300 p-4 gap-1">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold m-0 pl-1">{mine ? "You said" : "They said"}</h2>
        <button
          className="btn btn-ghost btn-circle"
          aria-label="Refresh"
          disabled={refreshing}
          onClick={() => refresh()}
        >
          <ArrowPathIcon className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
      {!messages ? (
        <span className="loading loading-dots mx-auto my-4" />
      ) : messages.length ? (
        messages.map((message, i) => (
          <div key={i} className={`chat ${mine ? "chat-end" : "chat-start"}`}>
            <div className={`chat-bubble break-words ${mine ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
              {message}
            </div>
          </div>
        ))
      ) : (
        <p className="text-base-content/70 text-center">
          {mine ? "Nothing yet. Say hi!" : "Nothing yet. Check back soon!"}
        </p>
      )}
    </div>
  );
};
