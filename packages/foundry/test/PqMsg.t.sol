// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/PqMsg.sol";

contract PqMsgTest is Test {
    PqMsg pqmsg = new PqMsg();
    address alice = makeAddr("alice");

    function testRegisterListsUserWithKey() public {
        vm.prank(alice);
        pqmsg.register(42);

        assertEq(pqmsg.keys(alice), 42);
        assertEq(pqmsg.getUsers().length, 1);
        assertEq(pqmsg.users(0), alice);
    }
}
