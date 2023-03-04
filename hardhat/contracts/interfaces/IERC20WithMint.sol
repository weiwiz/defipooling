pragma solidity ^0.8.9;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC20WithMint is IERC20 {
    function mint(address to, uint256 amount) external;
}
