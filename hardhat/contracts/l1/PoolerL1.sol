// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import {GateL1} from "./GateL1.sol";
import {VaultL1} from "./VaultL1.sol";

contract PoolerL1 is Ownable, AutomationCompatibleInterface {
    address public usdc;
    address public fusdc;
    address payable public gateAddress;

    bool public rideOngoing;
    uint256 public rideArrivedTimestamp;
    uint256 public upKeepInterval;

    uint256 public lastMintedAmount;

    constructor(address _usdc, address _fusdc, uint256 _upKeepInterval) {
        usdc = _usdc;
        fusdc = _fusdc;
        upKeepInterval = _upKeepInterval; // 300 for 5 minutes
    }

    modifier notDuringRide() {
        require(rideOngoing == false, "Ride in progress. Try later");
        _;
    }
    modifier hasAGate() {
        require(gateAddress != address(0), "No gate address set");
        _;
    }

    // call par la gate l1 apres que le bus aller soit arrivé
    function finalizeWarp(uint256 totalAmountToWithdraw) public notDuringRide {
        require(
            msg.sender == gateAddress,
            "Only gateway can call this function"
        );
        rideOngoing = true;
        rideArrivedTimestamp = block.timestamp;

        uint256 totalAmountToDeposit = IERC20(usdc).balanceOf(address(this));
        // Deposit
        uint256 oldfUSDCbalance = IERC20(fusdc).balanceOf(address(this));

        IERC20(usdc).approve(fusdc, totalAmountToDeposit);
        VaultL1(fusdc).deposit(totalAmountToDeposit, address(this));

        uint256 newfUSDCbalance = IERC20(fusdc).balanceOf(address(this));
        lastMintedAmount = newfUSDCbalance - oldfUSDCbalance;

        // Withdraw
        IERC20(fusdc).approve(fusdc, totalAmountToWithdraw);
        VaultL1(fusdc).redeem(
            totalAmountToWithdraw,
            address(this),
            address(this)
        );
    }

    // pour lancer le retour
    // call la gate l1
    // lastExchange rate et amount withdrawn
    function launchBus(address _driverAddress) public payable hasAGate {
        require(rideOngoing == true, "No ride in progress");

        uint256 lastUSDCAmountWithdrawn = IERC20(usdc).balanceOf(address(this));

        IERC20(usdc).transfer(gateAddress, lastUSDCAmountWithdrawn);

        GateL1(gateAddress).unWarp{value: address(this).balance}(
            lastMintedAmount,
            lastUSDCAmountWithdrawn,
            _driverAddress
        );
        rideOngoing = false;
    }

    // function to set gate address
    function setGateAddress(address _gateAddress) public onlyOwner {
        gateAddress = payable(_gateAddress);
    }

    //function to set rideOngoing
    function setRideOngoing(bool _rideOngoing) public onlyOwner {
        rideOngoing = _rideOngoing;
    }

    function checkUpkeep(
        bytes calldata
    ) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded =
            rideOngoing &&
            (block.timestamp - rideArrivedTimestamp) > upKeepInterval;
    }

    function performUpkeep(bytes calldata) external override {
        if (
            rideOngoing &&
            (block.timestamp - rideArrivedTimestamp) > upKeepInterval
        ) {
            launchBus(owner()); // when Chainlink relayer calls, driver fee comes back to us
        }
    }
}
