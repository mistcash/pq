import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DiveStep = "unlock" | "open" | "send" | "read" | "find";

/**
 * Every value the deep dive shows, in order, with where it lives: a "secret" key (hidden until you tap it), something
 * that stays in your "browser", or something anyone can read on the "chain" or on "arkiv".
 */
export const VALUES = {
  prfOutput: ["Passkey PRF output", "secret"],
  senderKey: ["Sender Key", "secret"],
  userKey: ["User Key", "arkiv"],
  userKeyHash: ["User Key Hash", "chain"],
  userIndex: ["Their User Index", "browser"],
  channelKey: ["Channel Key", "secret"],
  channelKeyHash: ["Channel Key Hash", "chain"],
  encryptedChannelKey: ["Encrypted Channel Key", "arkiv"],
  encryptedSender: ["Encrypted Sender", "arkiv"],
  proof: ["Proof", "chain"],
  provingTime: ["Proving time", "browser"],
  messageIndex: ["Message Index", "browser"],
  messageKey: ["Message Key", "secret"],
  messageId: ["Message ID", "chain"],
  ciphertext1: ["Ciphertext Element 1", "chain"],
  ciphertext2: ["Ciphertext Element 2", "chain"],
  users: ["Users checked", "browser"],
  channels: ["Channels checked", "browser"],
  found: ["Chats found", "browser"],
  tx: ["Transaction", "chain"],
  entity: ["Arkiv entity", "arkiv"],
} as const;

export type DiveValues = Partial<Record<keyof typeof VALUES, string>>;

type DeepDiveState = { on: boolean; steps: Partial<Record<DiveStep, DiveValues>> };

/** Whether deep dive mode is on, remembered in this browser, and what each step last computed, in memory only. */
export const useDeepDive = create<DeepDiveState>()(
  persist((): DeepDiveState => ({ on: false, steps: {} }), {
    name: "pqmsg:deep-dive",
    partialize: ({ on }) => ({ on }),
    // Read after the first render, so the server's and the browser's first renders match.
    skipHydration: true,
  }),
);

/** Records what a step just computed, replacing what it recorded before. */
export const recordStep = (step: DiveStep, values: DiveValues) =>
  useDeepDive.setState(state => ({ steps: { ...state.steps, [step]: values } }));

/** Adds the transaction a recorded step just sent. */
export const recordTx = (step: DiveStep, tx: string) =>
  useDeepDive.setState(state => ({ steps: { ...state.steps, [step]: { ...state.steps[step], tx } } }));

/** Adds the Arkiv entity a recorded step just stored. */
export const recordEntity = (step: DiveStep, entity: string) =>
  useDeepDive.setState(state => ({ steps: { ...state.steps, [step]: { ...state.steps[step], entity } } }));
