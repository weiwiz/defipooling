// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const prompt = require('prompt-sync')();

async function main() {

  const USDC = await hre.ethers.getContractFactory("USDC");
  const usdc = await USDC.deploy("USD Coin Mock", "USDC");
  await usdc.deployed();
  console.log("usdc deployed to:", usdc.address);
  const PoolerL2 = await hre.ethers.getContractFactory("PoolerL2");
  const pooler = await PoolerL2.deploy(usdc.address);
  await pooler.deployed();
  console.log("Pooler deployed to:", pooler.address);
  const GateL2Alternative = await hre.ethers.getContractFactory("GateL2Alternative");
  const gateL2 = await GateL2Alternative.deploy(
    usdc.address,
    pooler.address,
  );
  await gateL2.deployed();
  console.log("Gate deployed to:", gateL2.address);
  const updatePooler = await pooler.setGateAddress(gateL2.address);
  await updatePooler.wait();
  console.log("Pooler updated with gateL2 address");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
