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