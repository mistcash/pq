// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "forge-std/Test.sol";
import "../contracts/PqMsg.sol";

contract PqMsgTest is Test {
    PqMsg public pqMsg;
    uint256 channelKeyHash;
    uint256[37] encryptedChannelKey;
    bytes proof;
    address alice = makeAddr("alice");

    function setUp() public {
        pqMsg = new PqMsg(new Verifier());
        string memory json = vm.readFile("test/openChannelProof.json");
        channelKeyHash = vm.parseJsonUint(json, ".channelKeyHash");
        uint256[] memory ct = vm.parseJsonUintArray(json, ".encryptedChannelKey");
        for (uint256 i; i < 37; i++) {
            encryptedChannelKey[i] = ct[i];
        }
        proof = vm.parseJsonBytes(json, ".proof");
    }

    /// An 800-byte User Key starting with `b`.
    function key(uint8 b) internal pure returns (bytes memory k) {
        k = new bytes(800);
        k[0] = bytes1(b);
    }

    function testDeployerOwns() public view {
        assertEq(pqMsg.owner(), address(this));
    }

    function testOwnerSetsVerifier() public {
        Verifier next = new Verifier();
        pqMsg.setVerifier(next);
        assertEq(address(pqMsg.verifier()), address(next));
    }

    function testSetVerifierRejectsNonOwner() public {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        vm.prank(alice);
        pqMsg.setVerifier(Verifier(address(0)));
    }

    function testRegisterListsUserWithKey() public {
        vm.prank(alice);
        pqMsg.register(key(42));

        assertEq(pqMsg.userKeyHashes(alice), keccak256(key(42)));
        assertEq(pqMsg.getUsers().length, 1);
        assertEq(pqMsg.users(0), alice);
    }

    function testRegisterAgainReplacesKeyAndKeepsUserIndex() public {
        address bob = makeAddr("bob");
        vm.prank(alice);
        pqMsg.register(key(1));
        vm.prank(bob);
        pqMsg.register(key(2));
        vm.prank(alice);
        pqMsg.register(key(3));

        assertEq(pqMsg.userKeyHashes(alice), keccak256(key(3)));
        assertEq(pqMsg.getUsers().length, 2);
        assertEq(pqMsg.users(0), alice);
        assertEq(pqMsg.users(1), bob);
    }

    function testRegisterEmitsRegistered() public {
        vm.expectEmit(address(pqMsg));
        emit PqMsg.Registered(alice, keccak256(key(42)));
        vm.prank(alice);
        pqMsg.register(key(42));
    }

    function testRegisterRejectsUserKeyNot800Bytes() public {
        vm.expectRevert(PqMsg.BadUserKey.selector);
        vm.prank(alice);
        pqMsg.register(new bytes(799));
    }

    function testOpenChannel() public {
        pqMsg.openChannel(channelKeyHash, encryptedChannelKey, 7, proof);

        bytes32[] memory opened = pqMsg.getChannels();
        assertEq(opened.length, 1);
        assertEq(opened[0], keccak256(abi.encode(channelKeyHash, encryptedChannelKey, uint256(7))));
    }

    function testOpenChannelEmitsChannelOpened() public {
        vm.expectEmit(address(pqMsg));
        emit PqMsg.ChannelOpened(channelKeyHash, keccak256(abi.encode(channelKeyHash, encryptedChannelKey, uint256(7))));
        pqMsg.openChannel(channelKeyHash, encryptedChannelKey, 7, proof);
    }

    function testOpenChannelRevertsOnBadProof() public {
        proof[0] ^= 0x01;
        vm.expectRevert(Verifier.ProofInvalid.selector);
        pqMsg.openChannel(channelKeyHash, encryptedChannelKey, 7, proof);
    }

    function testOpenChannelRevertsOnWrongChannelKeyHash() public {
        vm.expectRevert(Verifier.ProofInvalid.selector);
        pqMsg.openChannel(channelKeyHash + 1, encryptedChannelKey, 7, proof);
    }

    function testPostStoresCiphertextUnderMessageId() public {
        vm.prank(alice);
        pqMsg.post(7, 1, 2);

        (uint256 ciphertext1, uint256 ciphertext2) = pqMsg.messages(7);
        assertEq(ciphertext1, 1);
        assertEq(ciphertext2, 2);
    }

    function testPostEmitsPosted() public {
        vm.expectEmit(address(pqMsg));
        emit PqMsg.Posted(7);
        pqMsg.post(7, 1, 2);
    }

    function testPostRevertsOnUsedMessageId() public {
        pqMsg.post(7, 1, 2);

        vm.expectRevert(PqMsg.MessageIdUsed.selector);
        pqMsg.post(7, 3, 4);
    }

    function testPostRejectsZeroCiphertext() public {
        vm.expectRevert(PqMsg.ZeroCiphertext.selector);
        pqMsg.post(7, 0, 0);
    }
}
