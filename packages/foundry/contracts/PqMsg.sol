// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Verifier } from "./Verifier.sol";

/// pqmsg: messages stored publicly on-chain, with hashes of the User Keys and Channels kept on Arkiv (ADR-0005).
contract PqMsg is Ownable {
    /// A message's two Ciphertext Elements.
    struct Message {
        uint256 ciphertext1;
        uint256 ciphertext2;
    }

    /// Checks openChannel proofs; the owner replaces it when the circuit changes.
    Verifier public verifier;
    /// Users in registration order; a User's position is their User Index.
    address[] public users;
    /// keccak256 of each User's User Key, a packed Kyber512 public key; zero means not registered.
    mapping(address => bytes32) public userKeyHashes;
    /// keccak256 of each Channel's abi.encode(channelKeyHash, encryptedChannelKey, encryptedSender).
    bytes32[] public channels;
    /// Messages by Message ID; all zeros means no message.
    mapping(uint256 => Message) public messages;

    /// A User registered or replaced their User Key.
    event Registered(address indexed user);
    event ChannelOpened(uint256 indexed channelKeyHash);
    event Posted(uint256 indexed messageId);

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
        if (userKeyHashes[msg.sender] == 0) users.push(msg.sender);
        userKeyHashes[msg.sender] = keccak256(key);
        emit Registered(msg.sender);
    }

    function getUsers() external view returns (address[] memory) {
        return users;
    }

    /// Opens a Channel once `proof` shows `encryptedChannelKey` encrypts the Channel Key behind `channelKeyHash`.
    /// `encryptedChannelKey` is Kyber512 u‖v, 21 12-bit coefficients per element; `encryptedSender` is the sender's
    /// User Index plus a pad from the Channel Key.
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
        channels.push(keccak256(abi.encode(channelKeyHash, encryptedChannelKey, encryptedSender)));
        emit ChannelOpened(channelKeyHash);
    }

    /// Every Channel's hash, against which the app checks the Channels it fetches from Arkiv.
    function getChannels() external view returns (bytes32[] memory) {
        return channels;
    }

    /// Stores a message's Ciphertext Elements under its Message ID, which must be unused. Anyone can post.
    /// All zeros reads as no message, so it can't be posted.
    function post(uint256 messageId, uint256 ciphertext1, uint256 ciphertext2) external {
        if (ciphertext1 == 0 && ciphertext2 == 0) revert ZeroCiphertext();
        Message storage message = messages[messageId];
        if (message.ciphertext1 != 0 || message.ciphertext2 != 0) revert MessageIdUsed();
        messages[messageId] = Message(ciphertext1, ciphertext2);
        emit Posted(messageId);
    }
}
