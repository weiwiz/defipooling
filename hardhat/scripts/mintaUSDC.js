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
  // get own address
  const [deployer] = await hre.ethers.getSigners();

  // mint USDC on L2
  const usdc = await hre.ethers.getContractAt("IERC20WithMint", usdcAddress);
  const mint = await usdc.mint(deployer.address, "1000000000000000000");
  await mint.wait();
  console.log("USDC minted on L2");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
