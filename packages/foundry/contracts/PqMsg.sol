// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Verifier } from "./Verifier.sol";

/// pqmsg: Channels and messages stored publicly on-chain.
contract PqMsg is Verifier {
    struct Channel {
        uint256 channelKeyHash;
        bytes encryptedChannelKey;
    }

    /// Users in registration order; a User's position is their User Index.
    address[] public users;
    /// User Key of each User; zero means not registered.
    mapping(address => uint256) public keys;
    Channel[] public channels;

    error ZeroKey();

    function register(uint256 key) external {
        if (key == 0) revert ZeroKey();
        if (keys[msg.sender] == 0) users.push(msg.sender);
        keys[msg.sender] = key;
    }

    function getUsers() external view returns (address[] memory) {
        return users;
    }

    /// Opens a Channel once `proof` shows knowledge of the Channel Key behind `channelKeyHash`.
    function openChannel(uint256 channelKeyHash, bytes calldata encryptedChannelKey, bytes calldata proof) external {
        this.verifyProof(proof, [channelKeyHash]);
        channels.push(Channel(channelKeyHash, encryptedChannelKey));
    }
}
