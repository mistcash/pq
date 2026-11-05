# pqmsg

Install matt pocock skills before starting.

we are building post quantum secure messaging layer for ethereum testnet.

## PHASE 1 - registration and message sending

Set up a project with Solidity smart contracts. init with https://scaffoldeth.io/ with forge. Add a dummy hash preimage circuit, generate a verifier contract and add the prover to the front end with wasm.
And inside the circuit use hash and add encryption to encrypt a message with the image.
The flow is,
1. the users register onto our contract via the front after connecting their wallet and then they register their key.
2. The registered users are shown in a list and the user selects the user of their  choice to send a message to.
3. Then they use the circuit to do the key exchange with the user, for now assume the user picks arbitrary master key. And the circuit just checks the master key hashes to the public parameter. This public parameter is stored for the channel between the two users.
4. To send a message user takes the master key, encrypts it with message index (unconstrained private input) to obtain message key msgk. then use the hash of message key and 0 as message id,
then two 31 byte messages in two elements with hash message key and 1 and 2 respectively, the classic hash and add with 0th element used for identification.
5. The contract stores the two message elements on a publicly readable hashmap with the two message elements as u256 values.

Contract stores:
1. List of registered users with their u256 key (dummy for now, will be used later for encryption.
2. Sessions array: array of open sessions, just hash of the message for now, will later include encryptions.
3. Messages array: hashmap of message ID and messages.

## Deploy to Sepolia

Locally, `yarn chain`, `yarn deploy` and `yarn start` run everything on anvil, with an anvil account as the Fixed Sender. To ship to Sepolia:

1. **Deployer.** Create a keystore with `yarn generate`, or import a key with `yarn account:import`. Fund its address with Sepolia ETH; `yarn account` shows the address and balance. The deploy uses about 12M gas.
2. **Deploy.** Run `yarn deploy --network sepolia --keystore <name>`. It reaches Sepolia through Alchemy with `ALCHEMY_API_KEY` from `packages/foundry/.env`; the template's shared key works, and your own avoids rate limits. It writes the address into `packages/nextjs/contracts/deployedContracts.ts`. Commit that file with `packages/foundry/broadcast/Deploy.s.sol/11155111/` and `packages/foundry/deployments/11155111.json`, so later deploys keep the Sepolia address.
3. **Fixed Sender.** Create a separate account with `cast wallet new` and send it Sepolia ETH. It pays the gas for every Channel opening (about 430k gas) and message (about 240k gas), so keep it topped up.
4. **Frontend env.** Set these in `packages/nextjs/.env.local`, or in your host's environment settings, such as Vercel's:
   - `NEXT_PUBLIC_TARGET_NETWORK=sepolia`, which is read at build time.
   - `FIXED_SENDER_PRIVATE_KEY`: the Fixed Sender's key. It's server-only, so never prefix it with `NEXT_PUBLIC_`. Without it, sending fails with an error that names it.
   - `FIXED_SENDER_RPC_URL` (optional): a server-only Sepolia RPC for the Fixed Sender. It defaults to Alchemy with `NEXT_PUBLIC_ALCHEMY_API_KEY`.
   - `NEXT_PUBLIC_ALCHEMY_API_KEY` and `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` (recommended): your own keys instead of the template's shared ones.
5. **Run.** `yarn start` serves the app in dev mode, and `yarn next:build && yarn next:serve` builds and serves it for production. On Vercel, `yarn vercel --prod` deploys it.
