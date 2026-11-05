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

    function testRegisterAgainReplacesKeyAndKeepsUserIndex() public {
        address bob = makeAddr("bob");
        vm.prank(alice);
        pqmsg.register(1);
        vm.prank(bob);
        pqmsg.register(2);
        vm.prank(alice);
        pqmsg.register(3);

        assertEq(pqmsg.keys(alice), 3);
        assertEq(pqmsg.getUsers().length, 2);
        assertEq(pqmsg.users(0), alice);
        assertEq(pqmsg.users(1), bob);
    }

    function testRegisterRejectsZeroKey() public {
        vm.expectRevert(PqMsg.ZeroKey.selector);
        vm.prank(alice);
        pqmsg.register(0);
    }
}
