// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

import {GateL2} from "./GateL2.sol";

contract PoolerL2 is ERC20, Ownable {
    address public usdc;
    address payable public gateAddress;

    uint256 public feeRate = 50; // 0.50% fee
    uint256 public feeBucket;

    bool public rideOngoing;
    address public driver;

    uint256 public totalAmountToDeposit; //in USDC, 6 decimals
    mapping(address => uint256) public depositsWaiting;
    address[] public depositQueue;

    uint256 public totalAmountToWithdraw; //in pUSDC, 6 decimals
    mapping(address => uint256) public withdrawsWaiting;
    address[] public withdrawQueue;

    constructor(address _usdc) ERC20("pooled USDC", "pUSDC") {
        usdc = _usdc;
        _mint(msg.sender, 10000000000); //Only for testing purposes
        _mint(0x9D392187c08fc28A86e1354aD63C70897165b982, 10000000000); //Only for testing purposes
    }

    modifier hasAGate() {
        require(gateAddress != address(0), "No gate address set");
        _;
    }

    function decimals() public pure override returns (uint8) {
        return 8;
    }

    modifier notDuringRide() {
        require(rideOngoing == false, "Ride in progress. Try later");
        _;
    }

    function deposit(uint256 amount) public notDuringRide {
        uint256 fee = (amount * feeRate) / 10000;
        feeBucket += fee;

        depositsWaiting[msg.sender] = amount - fee;
        totalAmountToDeposit += amount - fee;
        depositQueue.push(msg.sender);

        IERC20(usdc).transferFrom(msg.sender, address(this), amount);
    }

    function cancelDeposit() public notDuringRide {
        uint256 depositAmount = depositsWaiting[msg.sender];

        require(depositAmount > 0, "No deposit ticket found");

        uint256 originalAmount = (depositAmount * 10000) / (10000 - feeRate);
        uint256 fee = originalAmount - depositAmount;

        feeBucket -= fee;
        totalAmountToDeposit -= depositAmount;

        IERC20(usdc).transfer(msg.sender, originalAmount);
        delete depositsWaiting[msg.sender];

        for (uint i = 0; i < depositQueue.length; i++) {
            if (depositQueue[i] == msg.sender) {
                delete depositQueue[i];
            }
        }
    }

    function withdraw(uint256 amount) public notDuringRide {
        uint256 position = balanceOf(msg.sender);

        require(position > 0, "No position found");
        require(position >= amount, "Cannot withdraw more than position");

        withdrawsWaiting[msg.sender] = amount;
        totalAmountToWithdraw += amount;

        _burn(msg.sender, amount);
        withdrawQueue.push(msg.sender);
    }

    function cancelWithdraw() public notDuringRide {
        uint256 withdrawAmount = withdrawsWaiting[msg.sender];

        require(withdrawAmount > 0, "No deposit ticket found");

        _mint(msg.sender, withdrawAmount);
        delete withdrawsWaiting[msg.sender];
        for (uint i = 0; i < withdrawQueue.length; i++) {
            if (withdrawQueue[i] == msg.sender) {
                delete withdrawQueue[i];
            }
        }
    }

    // called to start the ride
    function launchBus() public payable notDuringRide hasAGate {
        require(
            totalAmountToDeposit > 0 || totalAmountToWithdraw > 0,
            "No deposits or withdraw to launch bus with"
        );
        rideOngoing = true;
        driver = msg.sender;

        IERC20(usdc).transfer(gateAddress, totalAmountToDeposit);

        GateL2(gateAddress).warp{value: msg.value}(
            totalAmountToDeposit,
            totalAmountToWithdraw
        );
    }

    // called by l2 gate after bus is back
    function finalizeUnwarp(
        uint256 lastMintedAmount,
        address returnDriver
    ) public {
        require(msg.sender == gateAddress, "Only gate can call this function");
        require(rideOngoing == true, "No ride in progress");

        // for each fUSDC minted on L1, mint pUSDC proportionately to deposits
        for (uint i = 0; i < depositQueue.length; i++) {
            address user = depositQueue[i];
            uint256 amount = depositsWaiting[user];
            _mint(user, (amount * lastMintedAmount) / totalAmountToDeposit);
            delete depositsWaiting[user];
        }
        delete depositQueue;
        totalAmountToDeposit = 0;

        // pay drivers, half goes to each
        uint256 driverFee = feeBucket / 2;
        IERC20(usdc).transfer(driver, driverFee);
        IERC20(usdc).transfer(returnDriver, driverFee);
        feeBucket = 0;

        // distribute USDC received proportionately to withdraws in withdrawQueue
        uint256 amountWithdrawn = IERC20(usdc).balanceOf(address(this));
        for (uint i = 0; i < withdrawQueue.length; i++) {
            address user = withdrawQueue[i];
            uint256 amount = withdrawsWaiting[user];
            IERC20(usdc).transfer(
                user,
                (amount * amountWithdrawn) / totalAmountToWithdraw
            );
            delete withdrawsWaiting[user];
        }
        delete withdrawQueue;
        totalAmountToWithdraw = 0;

        rideOngoing = false;
    }

    // function to set gate address
    function setGateAddress(address _gateAddress) public onlyOwner {
        gateAddress = payable(_gateAddress);
    }

    function depositQueueLength() public view returns (uint256) {
        return depositQueue.length;
    }

    function withdrawQueueLength() public view returns (uint256) {
        return withdrawQueue.length;
    }

    // function to set rideOnGoing
    function setRideOngoing(bool _rideOngoing) public onlyOwner {
        rideOngoing = _rideOngoing;
    }
}
