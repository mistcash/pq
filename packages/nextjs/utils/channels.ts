import { type Address, type Hex, getAddress } from "viem";

const storageKey = (from: Address, to: Address) => `pqmsg:channel:${getAddress(from)}:${getAddress(to)}`;

/** Caches the Channel Key from one User to another in browser storage; finding chats brings it back. */
export const saveChannelKey = (from: Address, to: Address, channelKey: Hex) =>
  localStorage.setItem(storageKey(from, to), channelKey);

export const loadChannelKey = (from: Address, to: Address) =>
  (localStorage.getItem(storageKey(from, to)) ?? undefined) as Hex | undefined;
