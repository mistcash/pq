"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import type { Hex } from "viem";
import { ArrowPathIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Confetti } from "~~/components/Confetti";
import { useMessages } from "~~/hooks/useMessages";
import { notification } from "~~/utils/scaffold-eth";

type Props = { channelKey: Hex; mine?: boolean; children?: ReactNode };

/** A Channel's messages in order, with a refresh button and a pinned footer: the composer for your own, else children. */
export const Messages = ({ channelKey, mine, children }: Props) => {
  const { messages, refresh, refreshing, send } = useMessages(channelKey);
  const count = messages?.length;
  const seen = useRef(count);

  // New messages land just above the pinned composer, so scroll them into view.
  useEffect(() => {
    if (seen.current !== undefined && count! > seen.current) scrollTo(0, document.body.scrollHeight);
    seen.current = count;
  }, [count]);

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
            <div
              className={`chat-bubble break-words animate-pop ${mine ? "chat-bubble-primary origin-bottom-right" : "chat-bubble-secondary origin-bottom-left"}`}
            >
              {message}
            </div>
          </div>
        ))
      ) : (
        <p className="text-base-content/70 text-center">
          {mine ? "Nothing yet. Say hi!" : "Nothing yet. Check back soon!"}
        </p>
      )}
      <div className="sticky bottom-0 bg-base-100 py-3">{mine ? <Composer send={send} /> : children}</div>
    </div>
  );
};

/** Writes up to 62 bytes, counting down what's left. */
const Composer = ({ send }: { send: (message: string) => Promise<void> }) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(0);
  const left = 62 - new TextEncoder().encode(text).length;

  const submit = async () => {
    setSending(true);
    try {
      await send(text);
      setText("");
      setSent(sent + 1);
    } catch (e: any) {
      notification.error(e.message);
    }
    setSending(false);
  };

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={e => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        className="input input-lg flex-1 min-w-0"
        placeholder="Say something"
        enterKeyHint="send"
        value={text}
        disabled={sending}
        onChange={e => setText(e.target.value)}
      />
      <span className={`w-7 text-center font-semibold ${left < 0 ? "text-error" : "text-base-content/70"}`}>
        {left}
      </span>
      <div className="relative isolate">
        {sent > 0 && <Confetti key={sent} />}
        <button className="btn btn-primary btn-lg btn-circle" aria-label="Send" disabled={sending || !text || left < 0}>
          {sending ? <span className="loading loading-dots" /> : <PaperAirplaneIcon className="h-6 w-6" />}
        </button>
      </div>
    </form>
  );
};
