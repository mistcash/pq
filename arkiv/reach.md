# Reach

## Who it's for

People who want to message someone by their Ethereum address without trusting a server with what they say or who they say it to: DAO contributors, traders arranging OTC deals, researchers and journalists talking to sources. Anything posted to a public chain today can be harvested and read once quantum computers arrive; pqmsg's key exchange is Kyber512, so its messages don't come with that expiry date.

It's also for builders. pqmsg's User Keys are an open directory of post-quantum public keys on Arkiv, keyed by wallet (`arkiv.schema = str('pqmsg.userKey')`), so any app can encrypt to its users.

## Would they use it?

The main thing that would have stopped them was cost. Under Sepolia's Glamsterdam gas, joining cost 3.0M gas and every new chat 5.0M, which a sponsor paying for chats couldn't sustain. Moving the data to Arkiv cut those to 0.36M and 0.83M (`docs/gas.md`), and the Fixed Sender pays for chats, so a user only pays for the one transaction that joins.

What users need: a wallet and a browser whose passkeys support PRF, such as recent Chrome, Safari or Edge with a synced passkey manager. No Arkiv wallet or tokens are needed.

## Can they try it today?

Yes, on testnets:

- **Contracts:** PqMsg on Sepolia at [`0xFbF7…f515`](https://sepolia.etherscan.io/address/0xFbF7E8E3CC9C6C641F23aB5be6caBC919A8Af515), with its Verifier at `0x5e6a…c295`.
- **Data:** every pqmsg entity on Arkiv's Rabdi testnet, written by `0xaE7b…626C` ([explorer](https://rabdi.explorer.arkiv.network/address/0xaE7b2d4E92D21abf48672edcEEEB7892fcaB626C)), queryable with the `curl` in `schema.md`.
- **Relayer:** `yarn start` with `NEXT_PUBLIC_TARGET_NETWORK=sepolia` and a funded `FIXED_SENDER_PRIVATE_KEY` serves the Fixed Sender, whose `/api/fixed-sender` stores User Keys and Channels on Arkiv (README, "Deploy to Sepolia").
- **App:** it still reads User Keys and Channels from PqMsg, so it works against this deployment once its reads move to Arkiv, the next change. Then: join with Sepolia ETH in your wallet, open a Channel to another User, and tap 🤿 to watch each value land on Sepolia or Arkiv.

## Will we keep building it after Mumbai?

Yes. pqmsg is a research prototype on its way to something people rely on, and the README's security section lists what comes next:

- Renew Channels on Arkiv as their ends message, as User Keys already are.
- Replace the Fixed Sender with a relayer anyone can run.
- A one-shot `register`, so a quantum attacker who recovers a wallet key can't swap in their own User Key.
- A multi-party trusted setup, and ML-KEM in place of CPA-secure Kyber512.
- Move to Arkiv's mainnet once it launches, and to Ethereum mainnet after an audit.
