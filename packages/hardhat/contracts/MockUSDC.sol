// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// This is a simple ERC20 token that we will use as a stand-in for USDC on our local network.
// It mints 1,000,000 tokens to the person who deploys it.
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}
