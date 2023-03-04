const hre = require("hardhat");
const prompt = require('prompt-sync')();

async function main() {
  const poolerL2addr = "0x34596Aae4262488a795E571d4AcEfbbE4ca6b328"
  const poolerL2 = await ethers.getContractAt("PoolerL2", poolerL2addr);
  const res = await poolerL2.totalAmountToDeposit();
  console.log('res', res)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
