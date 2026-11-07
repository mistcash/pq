// Sends register, openChannel and post to a PqMsg and prints each one's gas, to compare deployments.
// Usage: PRIVATE_KEY=0x… RPC_URL=… node scripts-js/measureGas.js <PqMsg address>
import { ethers } from "ethers";
import { readFileSync } from "fs";

const abi = [
  "function register(bytes key)",
  "function openChannel(uint256 channelKeyHash, uint256[37] encryptedChannelKey, uint256 encryptedSender, bytes proof)",
  "function post(uint256 messageId, uint256 ciphertext1, uint256 ciphertext2)",
];
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const pqMsg = new ethers.Contract(process.argv[2], abi, wallet);
const fixture = JSON.parse(readFileSync(new URL("../test/openChannelProof.json", import.meta.url)));
const random = () => ethers.BigNumber.from(ethers.utils.randomBytes(31));

const calls = {
  register: () => pqMsg.register(ethers.utils.randomBytes(800)),
  openChannel: () =>
    pqMsg.openChannel(fixture.channelKeyHash, fixture.encryptedChannelKey, random(), fixture.proof),
  post: () => pqMsg.post(random(), random(), random()),
};
for (const [name, send] of Object.entries(calls)) {
  const receipt = await (await send()).wait();
  const fee = receipt.gasUsed.mul(receipt.effectiveGasPrice);
  console.log(`${name}\t${receipt.gasUsed}\t${ethers.utils.formatEther(fee)} ETH\t${receipt.transactionHash}`);
}
