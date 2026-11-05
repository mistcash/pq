// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/PqMsg.sol";

contract DeployPqMsg is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        new PqMsg();
    }
}
