// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {PoolerL2} from "./PoolerL2.sol";

contract GateL2Alternative is Ownable {
    address public iTokenAddress;
    address public pooler;

    constructor(address _iTokenAddress, address _pooler) {
        iTokenAddress = _iTokenAddress;
        pooler = _pooler;
    }

    // function to call the axelarGateway to send tokens to L1
    // this function is called when the bus leaves the l2
    function warp(
        uint256 amountToDeposit,
        uint256 amountToWithraw
    ) external payable {
        bytes memory payload = abi.encode(amountToWithraw);
        // IERC20(iTokenAddress).approve(address(bridge), amountToDeposit);

        //TODO: send to Base Testnet message-passing bridge
    }

    function _executeWithToken(
        string memory sourceChain,
        string memory sourceAddress,
        bytes calldata payload,
        string memory tokenSymbol,
        uint256 amount
    ) internal {
        //TODO: receive from Base Testnet message-passing bridge

        // check that the amount is not 0
        require(amount > 0, "Amount must be greater than 0");

        //check that the amount is not greater than the balance of the gate
        require(
            amount <= IERC20(iTokenAddress).balanceOf(address(this)),
            "Amount is greater than the balance of the gate"
        );

        // get lasmintedamount and driver from payload
        (uint256 lastMintedAmount, address driver) = abi.decode(
            payload,
            (uint256, address)
        );

        //tranfer the amount of tokens to the pooler
        IERC20(iTokenAddress).transfer(pooler, amount);

        // call pooler to finalizw the unwarp
        PoolerL2(pooler).finalizeUnwarp(lastMintedAmount, driver);
    }

    function _execute(
        string memory sourceChain,
        string memory sourceAddress,
        bytes calldata payload
    ) internal {
        //TODO: receive from Base Testnet message-passing bridge

        //get lastMintedAmount and driver from payload
        (uint256 lastMintedAmount, address driver) = abi.decode(
            payload,
            (uint256, address)
        );

        // call pooler to finalizw the unwarp
        PoolerL2(pooler).finalizeUnwarp(lastMintedAmount, driver);
    }

    // function to get the iToken balance of the gate
    // this is the amount of tokens that have been deposited
    // by users and are waiting to be sent to L1
    // function getITokensToInvest() public view returns(uint256){
    //     return IERC20(iTokenAddress).balanceOf(address(this));
    // }

    // owner only function to modify the l1GateAddress
    // function setL1GateAddress(string memory _l1GateAddress) public onlyOwner {
    //     l1GateAddress = _l1GateAddress;
    // }

    fallback() external payable {}

    receive() external payable {}
}
