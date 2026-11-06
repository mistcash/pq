# Gas: data on PqMsg vs hashes on PqMsg (ADR-0005)

Measured on Sepolia on 2026-11-06, which runs Glamsterdam, so each new byte of state costs about 1,530 gas (EIP-8037). Both contracts point at the same Verifier, [`0x56d4…9633`](https://sepolia.etherscan.io/address/0x56d42ba891FDC1f3367018f789aE964207499633). Each call is a first registration, a new Channel or a new message, sent by `packages/foundry/scripts-js/measureGas.js`:

```sh
cd packages/foundry
PRIVATE_KEY=0x… RPC_URL=https://ethereum-sepolia-rpc.publicnode.com node scripts-js/measureGas.js <PqMsg address>
```

| Call | Before: data on-chain | After: keccak256 on-chain | Saved |
| --- | ---: | ---: | ---: |
| `register` (800-byte User Key) | 3,113,643 ([tx](https://sepolia.etherscan.io/tx/0x04369161ed74359bfdd44872ad941eb4d56ce708a9f1bc92c40303426ccd899b)) | 360,732 ([tx](https://sepolia.etherscan.io/tx/0x498dc61de8f56a25459f0b21f6e40a60e76bb03e2d695e5bcb572d246d362630)) | 88% |
| `openChannel` (39 words + proof) | 5,014,387 ([tx](https://sepolia.etherscan.io/tx/0x821707b3fb56bdf719d3c0ca92a11086e31d4e06f6982bd578d68b7dc693b25e)) | 831,040 ([tx](https://sepolia.etherscan.io/tx/0xc1b78c541c0c937e765dd5a6d1cf95ea27cc1515364d4db781c51ccd8aee2d6f)) | 83% |
| `post` (unchanged) | 238,579 ([tx](https://sepolia.etherscan.io/tx/0x64a6316274c9296aad98d076d16053a59436f920a93bf1aea1a302f9be2c0f35)) | 238,579 ([tx](https://sepolia.etherscan.io/tx/0x2c6a1980c740824ff0a9a1b7fbe52ba16d999843244142eb5c93481c61798378)) | 0% |

Before is main's PqMsg at [`0xB847…4e49`](https://sepolia.etherscan.io/address/0xB84715554eD01b727dDF02173bd9eDEdAF024e49), deployed only for this comparison; after is [`0x83Ba…5c52`](https://sepolia.etherscan.io/address/0x83Ba93654CaC7a6F9489E81c89F4AaA48d755c52). At these transactions' 1.5 gwei, opening a Channel fell from 0.0075 to 0.0012 ETH.

What's left: `register` pays for one new slot for the hash and one for the User list, plus 800 bytes of calldata; `openChannel` pays for one slot, 1.6 KB of calldata and about 0.5M gas of Groth16 verification.

The Arkiv side costs the Fixed Sender Arkiv testnet gas instead, which grows with the entity's size and lifetime; see `arkiv/why-arkiv.md`.
