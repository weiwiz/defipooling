const hre = require("hardhat");
const prompt = require('prompt-sync')();

async function main() {
  const depositor = new ethers.Wallet(process.env.PKEY, ethers.provider);
  const poolerL2addr = "0x34596Aae4262488a795E571d4AcEfbbE4ca6b328";
    const poolerL2 = await ethers.getContractAt("PoolerL2", poolerL2addr);
    const setRide = await poolerL2.connect(depositor).setRideOngoing(false);
    console.log("setRide tx:", setRide.hash)
    await setRide.wait();
    console.log("Set Ride to false");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  