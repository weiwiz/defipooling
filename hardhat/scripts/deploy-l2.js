// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const prompt = require('prompt-sync')();

async function main() {


  const usdcAddress = "0x2c852e740B62308c46DD29B982FBb650D063Bd07";
  const axelarAddress = "0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B";
  const destinationChain = "ethereum-2";
  const symbol = "aUSDC";
  const gasService = "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6";

  const PoolerL2 = await hre.ethers.getContractFactory("PoolerL2");
  const pooler = await PoolerL2.deploy(usdcAddress);
  await pooler.deployed();
  console.log("Pooler deployed to:", pooler.address);
  const GateL2 = await hre.ethers.getContractFactory("GateL2");
  const gate = await GateL2.deploy(
    axelarAddress,
    destinationChain,
    symbol,
    usdcAddress,
    pooler.address,
    pooler.address,
    gasService
  );
  await gate.deployed();
  console.log("Gate deployed to:", gate.address);
  const updatePooler = await pooler.setGateAddress(gate.address);
  await updatePooler.wait();
  console.log("Pooler updated with Gate address");
  
  const gateL1addr = prompt('Enter GateL1 address');
  const setL1Gate = await gate.setL1GateAddress(gateL1addr);
  await setL1Gate.wait();
  console.log("Gate updated with L1 Gate address");
  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
