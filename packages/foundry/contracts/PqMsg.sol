// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Verifier } from "./Verifier.sol";

/// pqmsg: Channels and messages stored publicly on-chain.
contract PqMsg is Ownable {
    struct Channel {
        uint256 channelKeyHash;
        /// The Channel Key encrypted to the recipient's User Key: Kyber512 u‖v, 21 12-bit coefficients per element.
        uint256[37] encryptedChannelKey;
        /// The sender's User Index plus a pad from the Channel Key.
        uint256 encryptedSender;
    }

    /// A message's two Ciphertext Elements.
    struct Message {
        uint256 ciphertext1;
        uint256 ciphertext2;
    }

    /// Checks openChannel proofs; the owner replaces it when the circuit changes.
    Verifier public verifier;
    /// Users in registration order; a User's position is their User Index.
    address[] public users;
    /// User Key of each User, a packed Kyber512 public key; empty means not registered.
    mapping(address => bytes) public userKeys;
    Channel[] public channels;
    /// Messages by Message ID; all zeros means no message.
    mapping(uint256 => Message) public messages;

    /// A User registered or replaced their User Key.
    event Registered(address indexed user);
    /// A Channel was opened under its Channel Key Hash.
    event ChannelOpened(uint256 indexed channelKeyHash);

    error BadUserKey();
    error MessageIdUsed();
    error ZeroCiphertext();

    constructor(Verifier verifier_) Ownable(msg.sender) {
        verifier = verifier_;
    }

    function setVerifier(Verifier verifier_) external onlyOwner {
        verifier = verifier_;
    }

    function register(bytes calldata key) external {
        if (key.length != 800) revert BadUserKey();
        if (userKeys[msg.sender].length == 0) users.push(msg.sender);
        userKeys[msg.sender] = key;
        emit Registered(msg.sender);
    }

    function getUsers() external view returns (address[] memory) {
        return users;
    }

    /// Opens a Channel once `proof` shows `encryptedChannelKey` encrypts the Channel Key behind `channelKeyHash`.
    function openChannel(
        uint256 channelKeyHash,
        uint256[37] calldata encryptedChannelKey,
        uint256 encryptedSender,
        bytes calldata proof
    ) external {
        uint256[38] memory input;
        input[0] = channelKeyHash;
        for (uint256 i; i < 37; i++) {
            input[i + 1] = encryptedChannelKey[i];
        }
        verifier.verifyProof(proof, input);
        channels.push(Channel(channelKeyHash, encryptedChannelKey, encryptedSender));
        emit ChannelOpened(channelKeyHash);
    }

    /// Every Channel, so the app can find one by its Channel Key Hash.
    function getChannels() external view returns (Channel[] memory) {
        return channels;
    }

    /// Stores a message's Ciphertext Elements under its Message ID, which must be unused. Anyone can post.
    /// All zeros reads as no message, so it can't be posted.
    function post(uint256 messageId, uint256 ciphertext1, uint256 ciphertext2) external {
        if (ciphertext1 == 0 && ciphertext2 == 0) revert ZeroCiphertext();
        Message storage message = messages[messageId];
        if (message.ciphertext1 != 0 || message.ciphertext2 != 0) revert MessageIdUsed();
        messages[messageId] = Message(ciphertext1, ciphertext2);
    }
}
