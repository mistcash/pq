// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Verifier } from "./Verifier.sol";

/// pqmsg: Channels and messages stored publicly on-chain.
contract PqMsg is Verifier {
    struct Channel {
        uint256 channelKeyHash;
        bytes encryptedChannelKey;
    }

    Channel[] public channels;

    /// Opens a Channel once `proof` shows knowledge of the Channel Key behind `channelKeyHash`.
    function openChannel(uint256 channelKeyHash, bytes calldata encryptedChannelKey, bytes calldata proof) external {
        this.verifyProof(proof, [channelKeyHash]);
        channels.push(Channel(channelKeyHash, encryptedChannelKey));
    }
}
