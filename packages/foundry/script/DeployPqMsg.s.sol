// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/PqMsg.sol";

contract DeployPqMsg is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        Verifier verifier = new Verifier();
        deployments.push(Deployment("Verifier", address(verifier)));
        deployments.push(Deployment("PqMsg", address(new PqMsg(verifier))));
    }
}
