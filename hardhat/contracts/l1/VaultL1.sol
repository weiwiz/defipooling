// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

contract VaultL1 is ERC4626 {
    constructor(
        string memory name,
        string memory symbol,
        address underlying
    ) ERC20(name, symbol) ERC4626(IERC20(underlying)) {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
