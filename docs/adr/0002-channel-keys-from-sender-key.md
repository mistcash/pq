# Channel Keys are derived from a signature-based Sender Key

Each User's Sender Key is derived from their wallet's signature over a fixed message, and Channel Key = H(Sender Key, recipient's User Index). So there's nothing to back up beyond the wallet, and any device holding the wallet can rebuild the User's Channels and sent messages from chain data. We accept three costs. A leaked Sender Key exposes every Channel that User opened. A sender gets only one Channel per recipient, so there's no re-keying. Wallets that don't sign deterministically can't be used. Changing how keys are derived later would orphan existing Channels.

Amended by ADR-0004: the Sender Key also mixes in a Password, so the wallet alone no longer rebuilds it.
