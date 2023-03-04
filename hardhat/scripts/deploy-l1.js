// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const prompt = require('prompt-sync')();

async function main() {

  const usdcAddress = "0x254d06f33bDc5b8ee05b2ea472107E300226659A";
  const axelarAddress = "0xe432150cce91c13a887f7D836923d5597adD8E31";
  const destinationChain = "Polygon";
  const symbol = "aUSDC";
  const gasService = "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6";
  const vaultL1 = await hre.ethers.getContractFactory("VaultL1");
  const vault = await vaultL1.deploy("Example vault", "exUSDC", usdcAddress);
  await vault.deployed();
  console.log("Vault deployed to:", vault.address); 
  const PoolerL1 = await hre.ethers.getContractFactory("PoolerL1");
  const pooler = await PoolerL1.deploy(usdcAddress, vault.address, 300);
  await pooler.deployed();
  console.log("Pooler deployed to:", pooler.address);
  const l2gate = prompt('Enter L2 Gate address:');
  const GateL1 = await hre.ethers.getContractFactory("GateL1");
  const gate = await GateL1.deploy(
    axelarAddress,
    destinationChain,
    symbol,
    l2gate,
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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
 