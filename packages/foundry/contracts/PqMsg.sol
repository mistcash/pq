// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// pqmsg: Channels and messages stored publicly on-chain.
contract PqMsg {
    struct Channel {
        uint256 channelKeyHash;
        bytes encryptedChannelKey;
    }

    Channel[] public channels;

    function openChannel(uint256 channelKeyHash, bytes calldata encryptedChannelKey, bytes calldata) external {
        channels.push(Channel(channelKeyHash, encryptedChannelKey));
    }
}
