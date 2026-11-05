// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PqMsg {
    /// Users in registration order; a User's position is their User Index.
    address[] public users;
    /// User Key of each User; zero means not registered.
    mapping(address => uint256) public keys;

    error ZeroKey();

    function register(uint256 key) external {
        if (key == 0) revert ZeroKey();
        if (keys[msg.sender] == 0) users.push(msg.sender);
        keys[msg.sender] = key;
    }

    function getUsers() external view returns (address[] memory) {
        return users;
    }
}
