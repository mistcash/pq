// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Verifier } from "./Verifier.sol";

/// pqmsg: Channels and messages stored publicly on-chain.
contract PqMsg is Verifier {
    struct Channel {
        uint256 channelKeyHash;
        bytes encryptedChannelKey;
    }

    /// A message's two Ciphertext Elements.
    struct Message {
        uint256 ciphertext1;
        uint256 ciphertext2;
    }

    /// Users in registration order; a User's position is their User Index.
    address[] public users;
    /// User Key of each User; zero means not registered.
    mapping(address => uint256) public keys;
    Channel[] public channels;
    /// Messages by Message ID; all zeros means no message.
    mapping(uint256 => Message) public messages;

    error ZeroKey();
    error MessageIdUsed();

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

    /// Every Channel, so the app can find one by its Channel Key Hash.
    function getChannels() external view returns (Channel[] memory) {
        return channels;
    }

    /// Stores a message's Ciphertext Elements under its Message ID, which must be unused. Anyone can post.
    function post(uint256 messageId, uint256 ciphertext1, uint256 ciphertext2) external {
        Message storage message = messages[messageId];
        if (message.ciphertext1 != 0 || message.ciphertext2 != 0) revert MessageIdUsed();
        messages[messageId] = Message(ciphertext1, ciphertext2);
    }
}
