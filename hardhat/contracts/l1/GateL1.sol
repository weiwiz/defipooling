// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import {IAxelarExecutable} from "../interfaces/IAxelarExecutable.sol";
import {IAxelarGateway} from "../interfaces/IAxelarGateway.sol";
import {PoolerL1} from "./PoolerL1.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IAxelarGasService} from "../interfaces/IAxelarGasService.sol";

contract GateL1 is IAxelarExecutable {
    string public destinationChain;
    string public l2GateAddress;
    string public symbol;
    address public iTokenAddress;
    address public pTokenAddress;
    address public pooler;
    IAxelarGasService public gasService;

    constructor(
        address axelarGateway,
        string memory _destinationChain,
        string memory _symbol,
        string memory _l2GateAddress,
        address _iTokenAddress,
        address _pTokenAddress,
        address _pooler,
        address _gasService
    ) IAxelarExecutable(axelarGateway) {
        pooler = _pooler;
        destinationChain = _destinationChain;
        l2GateAddress = _l2GateAddress;
        symbol = _symbol;
        iTokenAddress = _iTokenAddress;
        pTokenAddress = _pTokenAddress;
        gasService = IAxelarGasService(_gasService);
    }

    // function to call the axelarGateway to send tokens to L2
    // this function is called when the bus leaves the l1
    function unWarp(
        uint256 lastMintedAmount,
        uint256 lastUSDCAmountWithdrawn,
        address driver
    ) public payable {
        bytes memory payload = abi.encode(lastMintedAmount, driver);
        IERC20(iTokenAddress).approve(
            address(gateway),
            lastUSDCAmountWithdrawn
        );

        // au choix: envoyer le montant de tokens manuellement ou
        // envoyer le montant de tokens qui sont dans la gate
        // IAxelarGateway(axelarGateway).callContractWithToken(destinationChain, l1GateAddress, payload, symbol, getITokensToInvest());
        if (lastUSDCAmountWithdrawn > 0) {
            // pay the gas to the bridge
            if (msg.value > 0) {
                // The line below is where we pay the gas fee
                gasService.payNativeGasForContractCallWithToken{
                    value: msg.value
                }(
                    address(this),
                    destinationChain,
                    l2GateAddress,
                    payload,
                    symbol,
                    lastUSDCAmountWithdrawn,
                    pooler //on L1, the gas is refunded to the pooler
                );
            }
            gateway.callContractWithToken(
                destinationChain,
                l2GateAddress,
                payload,
                symbol,
                lastUSDCAmountWithdrawn
            );
        } else {
            // pay the gas to the bridge
            if (msg.value > 0) {
                // The line below is where we pay the gas fee
                gasService.payNativeGasForContractCall{value: msg.value}(
                    address(this),
                    destinationChain,
                    l2GateAddress,
                    payload,
                    pooler //on L1, the gas is refunded to the pooler
                );
            }
            gateway.callContract(destinationChain, l2GateAddress, payload);
        }
    }

    // implement functions from IAxelarExecutable

    // function called when the tokens arrive on L1
    function _executeWithToken(
        string memory sourceChain,
        string memory sourceAddress,
        bytes calldata payload,
        string memory tokenSymbol,
        uint256 amount
    ) internal override {
        // check that the token is the one expected
        require(
            keccak256(abi.encodePacked(symbol)) ==
                keccak256(abi.encodePacked(tokenSymbol)),
            "Token symbol does not match"
        );
        // check that the amount is not 0
        require(amount > 0, "Amount must be greater than 0");
        // check that the source chain is the one expected
        require(
            keccak256(abi.encodePacked(destinationChain)) ==
                keccak256(abi.encodePacked(sourceChain)),
            "Source chain does not match"
        );

        // check that the source address is gatel2 address
        require(
            keccak256(abi.encodePacked(sourceAddress)) ==
                keccak256(abi.encodePacked(l2GateAddress)),
            "Source address does not match"
        );

        // get the amount to withdraw from the payload
        uint256 amountToWithdraw = abi.decode(payload, (uint256));

        // transfer the tokens to the pooler
        IERC20(iTokenAddress).transfer(pooler, amount);

        // call the pooler to invest the tokens
        PoolerL1(pooler).finalizeWarp(amountToWithdraw);
    }

    function _execute(
        string memory sourceChain,
        string memory sourceAddress,
        bytes calldata payload
    ) internal override {
        // check that the source chain is the one expected
        require(
            keccak256(abi.encodePacked(destinationChain)) ==
                keccak256(abi.encodePacked(sourceChain)),
            "Source chain does not match"
        );

        // check that the source address is gatel2 address
        require(
            keccak256(abi.encodePacked(sourceAddress)) ==
                keccak256(abi.encodePacked(l2GateAddress)),
            "Source address does not match"
        );

        // get the amount to withdraw from the payload
        uint256 amountToWithdraw = abi.decode(payload, (uint256));

        // call the pooler to invest the tokens
        PoolerL1(pooler).finalizeWarp(amountToWithdraw);
    }

    fallback() external payable {}

    receive() external payable {}
}
