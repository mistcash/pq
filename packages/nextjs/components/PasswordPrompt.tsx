"use client";

import { useState } from "react";
import { create } from "zustand";
import { FriendlyError } from "~~/utils/friendly";

/** Long enough that a quantum attacker can't guess it offline against your on-chain User Key (ADR-0004). */
const MIN_LENGTH = 12;

type Ask = { isNew: boolean; resolve: (password?: string) => void };
const usePrompt = create<{ ask?: Ask }>(() => ({}));

/** Asks for the password that, with your wallet's signature, makes your Sender Key. New Users pick one. */
export const askPassword = (isNew: boolean) =>
  new Promise<string>((resolve, reject) =>
    usePrompt.setState({
      ask: {
        isNew,
        resolve: password =>
          password ? resolve(password) : reject(new FriendlyError("Your password unlocks your chats. Try again?")),
      },
    }),
  );

/** The password sheet, shown while `askPassword` waits. */
export const PasswordPrompt = () => {
  const ask = usePrompt(state => state.ask);
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  if (!ask) return null;

  const close = (answer?: string) => {
    ask.resolve(answer);
    usePrompt.setState({ ask: undefined });
    setPassword("");
    setAgain("");
  };

  return (
    <dialog open className="modal modal-bottom sm:modal-middle">
      <form
        className="modal-box flex flex-col gap-4"
        onSubmit={e => {
          e.preventDefault();
          close(password);
        }}
      >
        <h2 className="text-2xl font-bold m-0">{ask.isNew ? "Pick a password" : "Your password"}</h2>
        <p className="text-base-content/70 m-0">
          {ask.isNew
            ? `It locks your chats along with your wallet, and there's no reset. Use at least ${MIN_LENGTH} characters; a few random words work great.`
            : "It unlocks your chats along with your wallet."}
        </p>
        <input
          type="password"
          className="input input-lg w-full"
          placeholder="Password"
          autoComplete={ask.isNew ? "new-password" : "current-password"}
          autoFocus
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {ask.isNew && (
          <input
            type="password"
            className="input input-lg w-full"
            placeholder="Once more"
            autoComplete="new-password"
            value={again}
            onChange={e => setAgain(e.target.value)}
          />
        )}
        <button
          className="btn btn-primary btn-lg btn-block"
          disabled={ask.isNew ? password.length < MIN_LENGTH || again !== password : !password}
        >
          Unlock
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={() => close()}>
          Cancel
        </button>
      </form>
    </dialog>
  );
};
