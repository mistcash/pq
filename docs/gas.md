# Gas: data on PqMsg vs hashes on PqMsg (ADR-0005)

Measured on Sepolia on 2026-11-06, which runs Glamsterdam, so each new byte of state costs about 1,530 gas (EIP-8037). Each call is a first registration, a new Channel or a new message.

| Call | Before: data stored | After: keccak256 stored | After: keccak256 stored and emitted | Saved |
| --- | ---: | ---: | ---: | ---: |
| `register` (`0x82fbdc9c`) | 3,015,735 ([tx](https://sepolia.etherscan.io/tx/0xd29ee5d47a6171fa6a18f2b52103caac23b76b78280780a2c0de19e33134658f)) | 360,732 ([tx](https://sepolia.etherscan.io/tx/0x498dc61de8f56a25459f0b21f6e40a60e76bb03e2d695e5bcb572d246d362630)) | 361,138 ([tx](https://sepolia.etherscan.io/tx/0xa2b7129c160327ac9cc4475920cd9a895b04a2e24f36819f567741a83c58515e)) | 88% |
| `openChannel` (`0x2d878493`) | 5,014,423 ([tx](https://sepolia.etherscan.io/tx/0xed6cac0a54e7c27322a610af5bfd1ec2839086e921e9feab7827590afe0a6a6e)) | 831,040 ([tx](https://sepolia.etherscan.io/tx/0xc1b78c541c0c937e765dd5a6d1cf95ea27cc1515364d4db781c51ccd8aee2d6f)) | 831,299 ([tx](https://sepolia.etherscan.io/tx/0x06b330efd6bc4c0425a1576c660dadbe869d52286264c7bd67e017555242a3aa)) | 83% |
| `post` (`0x82b1c733`, unchanged) | 238,615 ([tx](https://sepolia.etherscan.io/tx/0xbc8683151da2ec1e8c6f4b721144e23304fc1fcbe194c0a632e3a37ea7c8869a)) | 238,579 ([tx](https://sepolia.etherscan.io/tx/0x2c6a1980c740824ff0a9a1b7fbe52ba16d999843244142eb5c93481c61798378)) | 238,567 ([tx](https://sepolia.etherscan.io/tx/0x9ca7f63b26898216c74e6d1f20379c987a0fb774d0be98ecdf3e4d9a9d2c84d7)) | 0% |

- **Before** is the app's own traffic on the PqMsg that stored the data, [`0xf939…4fad`](https://sepolia.etherscan.io/address/0xf93965b5729d877f8325fec5f834e4e0e0224fad).
- **After, stored** is [`0x83Ba…5c52`](https://sepolia.etherscan.io/address/0x83Ba93654CaC7a6F9489E81c89F4AaA48d755c52), which stores only the hashes.
- **After, stored and emitted** is the current PqMsg, [`0xFbF7…f515`](https://sepolia.etherscan.io/address/0xFbF7E8E3CC9C6C641F23aB5be6caBC919A8Af515). Its `Registered` and `ChannelOpened` events also carry the hash each call stores, for 406 and 259 more gas.

A controlled run agrees with the before column: main's PqMsg, deployed at [`0xB847…4e49`](https://sepolia.etherscan.io/address/0xB84715554eD01b727dDF02173bd9eDEdAF024e49) with the same Verifier as `0x83Ba…5c52`, used 3,113,643 gas for `register` ([tx](https://sepolia.etherscan.io/tx/0x04369161ed74359bfdd44872ad941eb4d56ce708a9f1bc92c40303426ccd899b)), 5,014,387 for `openChannel` ([tx](https://sepolia.etherscan.io/tx/0x821707b3fb56bdf719d3c0ca92a11086e31d4e06f6982bd578d68b7dc693b25e)) and 238,579 for `post` ([tx](https://sepolia.etherscan.io/tx/0x64a6316274c9296aad98d076d16053a59436f920a93bf1aea1a302f9be2c0f35)).

`packages/foundry/scripts-js/measureGas.js` sends the three calls to any PqMsg:

```sh
cd packages/foundry
PRIVATE_KEY=0x… RPC_URL=https://ethereum-sepolia-rpc.publicnode.com node scripts-js/measureGas.js <PqMsg address>
```

What's left: `register` pays for one new slot for the hash and one for the User list, plus 800 bytes of calldata. `openChannel` pays for one slot, 1.6 KB of calldata and about 0.5M gas of Groth16 verification.

## The Arkiv side

The Fixed Sender stores the data on Arkiv's Rabdi testnet instead, for 182 days, at 1 gwei:

| Entity | Rabdi gas | tGLM |
| --- | ---: | ---: |
| User Key, 800 bytes | 513,978 ([tx](https://rabdi.explorer.arkiv.network/tx/0xacada3890b23245a97ea9af393e5d7136d8b8f42f10d005b82863398f70864e5)) | 0.00051 |
| Channel, 1,248 bytes | 578,386 ([tx](https://rabdi.explorer.arkiv.network/tx/0x767e4d1cb8a50271d3da0164c1dd7f47faee416078f7d9052f536d592ee08f93)) | 0.00058 |
