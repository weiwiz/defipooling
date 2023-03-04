const hre = require("hardhat");
const prompt = require('prompt-sync')();

async function main() {
  const depositor = new ethers.Wallet(process.env.PKEY, ethers.provider);

  const poolerL1addr = "0x2424E8421959f7e522AfDED0d607e60b30F6332D";
  const poolerL1 = await ethers.getContractAt("PoolerL1", poolerL1addr);

  // 10 USDC have to have been deposited already on L1
  const launchBus = await poolerL1.connect(depositor).launchBus(depositor.address, {
    value: ethers.utils.parseEther("0.1")
  });
  console.log("LaunchBus tx:", launchBus.hash)
  await launchBus.wait();
  console.log("Launched Bus");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
