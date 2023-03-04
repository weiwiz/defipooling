// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const prompt = require('prompt-sync')();

async function main() {


  const gateL2addr = "0x935952478e46Ea2cC65c87a9187D3d2F3dd05C24"
  const gateL1addr = "0xB5949E4F80FBD364661c28F4Fe3e0BAc277706d9"


  // get deployed GateL2 contract
  const GateL2 = await hre.ethers.getContractFactory("GateL2");
  const gate = await GateL2.attach(
    gateL2addr
  );
  
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
