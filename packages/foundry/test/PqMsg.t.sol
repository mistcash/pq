// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/PqMsg.sol";

contract PqMsgTest is Test {
    PqMsg public pqMsg;
    uint256 channelKeyHash;
    bytes proof;
    address alice = makeAddr("alice");

    function setUp() public {
        pqMsg = new PqMsg();
        string memory json = vm.readFile("test/openChannelProof.json");
        channelKeyHash = vm.parseJsonUint(json, ".channelKeyHash");
        proof = vm.parseJsonBytes(json, ".proof");
    }

    function testRegisterListsUserWithKey() public {
        vm.prank(alice);
        pqMsg.register(42);

        assertEq(pqMsg.userKeys(alice), 42);
        assertEq(pqMsg.getUsers().length, 1);
        assertEq(pqMsg.users(0), alice);
    }

    function testRegisterAgainReplacesKeyAndKeepsUserIndex() public {
        address bob = makeAddr("bob");
        vm.prank(alice);
        pqMsg.register(1);
        vm.prank(bob);
        pqMsg.register(2);
        vm.prank(alice);
        pqMsg.register(3);

        assertEq(pqMsg.userKeys(alice), 3);
        assertEq(pqMsg.getUsers().length, 2);
        assertEq(pqMsg.users(0), alice);
        assertEq(pqMsg.users(1), bob);
    }

    function testRegisterRejectsZeroUserKey() public {
        vm.expectRevert(PqMsg.ZeroUserKey.selector);
        vm.prank(alice);
        pqMsg.register(0);
    }

    function testOpenChannel() public {
        pqMsg.openChannel(channelKeyHash, hex"c0ffee", proof);

        (uint256 storedHash, bytes memory encryptedChannelKey) = pqMsg.channels(0);
        assertEq(storedHash, channelKeyHash);
        assertEq(encryptedChannelKey, hex"c0ffee");
    }

    function testGetChannelsListsOpenedChannels() public {
        pqMsg.openChannel(channelKeyHash, "", proof);

        PqMsg.Channel[] memory opened = pqMsg.getChannels();
        assertEq(opened.length, 1);
        assertEq(opened[0].channelKeyHash, channelKeyHash);
    }

    function testOpenChannelRevertsOnBadProof() public {
        proof[0] ^= 0x01;
        vm.expectRevert(Verifier.ProofInvalid.selector);
        pqMsg.openChannel(channelKeyHash, "", proof);
    }

    function testOpenChannelRevertsOnWrongChannelKeyHash() public {
        vm.expectRevert(Verifier.ProofInvalid.selector);
        pqMsg.openChannel(channelKeyHash + 1, "", proof);
    }

    function testPostStoresCiphertextUnderMessageId() public {
        vm.prank(alice);
        pqMsg.post(7, 1, 2);

        (uint256 ciphertext1, uint256 ciphertext2) = pqMsg.messages(7);
        assertEq(ciphertext1, 1);
        assertEq(ciphertext2, 2);
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
