// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/PqMsg.sol";

contract PqMsgTest is Test {
    PqMsg public pqMsg;
    uint256 channelKeyHash;
    bytes proof;

    function setUp() public {
        pqMsg = new PqMsg();
        string memory json = vm.readFile("test/openChannelProof.json");
        channelKeyHash = vm.parseJsonUint(json, ".channelKeyHash");
        proof = vm.parseJsonBytes(json, ".proof");
    }

    function testOpenChannel() public {
        pqMsg.openChannel(channelKeyHash, hex"c0ffee", proof);

        (uint256 storedHash, bytes memory encryptedChannelKey) = pqMsg.channels(0);
        assertEq(storedHash, channelKeyHash);
        assertEq(encryptedChannelKey, hex"c0ffee");
    }
}
