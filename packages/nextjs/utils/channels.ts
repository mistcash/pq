import { type Address, type Hex, getAddress, isAddress, isHex, size } from "viem";

/**
 * A join link is `<origin>/#from=<sender's address>&key=<Channel Key as 32-byte hex>`.
 * Both ride only in the fragment, which browsers never send to a server.
 */
export const joinLink = (from: Address, channelKey: Hex) => `${location.origin}/#from=${from}&key=${channelKey}`;

/** Reads a join link's fragment, such as `location.hash`; undefined if it isn't one. */
export const parseJoinLink = (fragment: string) => {
  const params = new URLSearchParams(fragment.replace(/^#/, ""));
  const from = params.get("from");
  const channelKey = params.get("key");
  if (from && isAddress(from) && isHex(channelKey) && size(channelKey) === 32) {
    return { from: getAddress(from), channelKey };
  }
};

const storageKey = (from: Address, to: Address) => `pqmsg:channel:${getAddress(from)}:${getAddress(to)}`;

/** Caches the Channel Key from one User to another in browser storage. It's only a cache. */
export const saveChannelKey = (from: Address, to: Address, channelKey: Hex) =>
  localStorage.setItem(storageKey(from, to), channelKey);

export const loadChannelKey = (from: Address, to: Address) =>
  (localStorage.getItem(storageKey(from, to)) ?? undefined) as Hex | undefined;
