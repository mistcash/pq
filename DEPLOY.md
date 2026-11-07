# Deploy to Sepolia

You need Node 20.18.3 or later, Yarn 4 (`corepack enable`) and Foundry, plus Go to rebuild the circuit. After `yarn install`, `yarn chain`, `yarn deploy` and `yarn start` run everything locally on anvil, with an anvil account as the Fixed Sender. To ship to Sepolia:

1. **Deployer.** Create a keystore with `yarn generate`, or import a key with `yarn account:import`. Fund its address with Sepolia ETH; `yarn account` shows the address and balance. The deployer becomes PqMsg's owner. The deploy uses about 22.6M gas in two transactions (Verifier 18.1M, PqMsg 4.5M), many times more than on local anvil, because Sepolia's Amsterdam fork charges far more for new contract code and storage. Forge's local simulation misses this, so live deploys estimate gas through the RPC (`--skip-simulation`).
2. **Deploy.** Run `yarn deploy --network sepolia --keystore <name>`. It reaches Sepolia through Alchemy with `ALCHEMY_API_KEY` from `packages/foundry/.env`; the template's shared key works, and your own avoids rate limits. It writes the address into `packages/nextjs/contracts/deployedContracts.ts`. Commit that file with `packages/foundry/broadcast/Deploy.s.sol/11155111/` and `packages/foundry/deployments/11155111.json`, so later deploys keep the Sepolia address.
3. **Fixed Sender.** Create a separate account with `cast wallet new` and send it Sepolia ETH. It pays the gas for every Channel opening (about 0.83M gas) and message (about 240k gas), so keep it topped up. It also stores User Keys and Channels on Arkiv's Rabdi testnet, so claim tGLM for it at the [Arkiv faucet](https://hub.arkiv.network/faucet), or set `ARKIV_PRIVATE_KEY` to another funded key.
4. **Frontend env.** Set these in `packages/nextjs/.env.local`, or in your host's environment settings, such as Vercel's:
   - `NEXT_PUBLIC_TARGET_NETWORK=sepolia`, which is read at build time.
   - `FIXED_SENDER_PRIVATE_KEY`: the Fixed Sender's key. It's server-only, so never prefix it with `NEXT_PUBLIC_`. Without it, sending fails with an error that names it.
   - `FIXED_SENDER_RPC_URL` (optional): a server-only Sepolia RPC for the Fixed Sender. It defaults to Alchemy with `NEXT_PUBLIC_ALCHEMY_API_KEY`.
   - `ARKIV_PRIVATE_KEY` (optional): a server-only key for Arkiv writes. It defaults to `FIXED_SENDER_PRIVATE_KEY`.
   - `NEXT_PUBLIC_ARKIV_ACCESS_KEY` (optional): an [Arkiv access key](https://hub.arkiv.network/access-keys), to lift the public RPC's rate limit.
   - `NEXT_PUBLIC_ALCHEMY_API_KEY` and `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` (recommended): your own keys instead of the template's shared ones.
5. **Run.** `yarn start` serves the app in dev mode, and `yarn next:build && yarn next:serve` builds and serves it for production. On Vercel, `yarn vercel --prod` deploys it.

## Sepolia deployment

| Contract | Address |
| --- | --- |
| PqMsg | [`0xFbF7E8E3CC9C6C641F23aB5be6caBC919A8Af515`](https://sepolia.etherscan.io/address/0xFbF7E8E3CC9C6C641F23aB5be6caBC919A8Af515) |
| Verifier | [`0x5e6a8B5dE890297931F9Ac77FF7c2bb5db7Fc295`](https://sepolia.etherscan.io/address/0x5e6a8B5dE890297931F9Ac77FF7c2bb5db7Fc295) |

The owner is `0xaE7b2d4E92D21abf48672edcEEEB7892fcaB626C`. Both were deployed in blocks 12079710 and 12079711. The transactions are in `packages/foundry/broadcast/Deploy.s.sol/11155111/`.

## Swapping the Verifier

The owner can replace the Verifier without redeploying PqMsg, which keeps its Users, Channels and messages:

1. `yarn circuits:build` regenerates `Verifier.sol` and the browser's proving key from one setup. They only work as a pair.
2. `forge create contracts/Verifier.sol:Verifier --rpc-url sepolia --account <owner> --broadcast` from `packages/foundry`.
3. `cast send <PqMsg> "setVerifier(address)" <new Verifier> --rpc-url sepolia --account <owner>`.
4. Ship the frontend with the new proving key.

If the circuit's number of public inputs changes, `openChannel` changes too, so PqMsg itself needs redeploying.
