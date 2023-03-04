const hre = require("hardhat");
const prompt = require('prompt-sync')();

async function main() {
  const depositor = new ethers.Wallet(process.env.PKEY, ethers.provider);
  const withdrawer = new ethers.Wallet(process.env.PKEY, ethers.provider);

  const poolerL2addr = "0xDf004020f283B46C40EE67917D8E9468c5C652e4"
  const ausdcAddressL2 = "0x2c852e740B62308c46DD29B982FBb650D063Bd07";

  const ausdcL2 = await ethers.getContractAt("USDC", ausdcAddressL2)
  const poolerL2 = await ethers.getContractAt("PoolerL2", poolerL2addr);

  // deposit on l2
  const approve = await ausdcL2.connect(depositor).approve(poolerL2.address, "10000000");
  console.log("approve tx:", approve.hash)
  await approve.wait();
  const deposit = await poolerL2.connect(depositor).deposit("10000000"); // deposit 10 aUSDC
  console.log("deposit tx:", deposit.hash)
  await deposit.wait();
  console.log("Deposited 10 aUSDC to L2 pooler");

  // withdraw on l2
  const approveWithdraw = await ausdcL2.connect(withdrawer).approve(poolerL2.address, "10000000");
  console.log("approve tx:", approveWithdraw.hash)
  await approveWithdraw.wait();
  const withdraw = await poolerL2.connect(withdrawer).withdraw("1000000"); // deposit 10 aUSDC
  console.log("withdraw tx:", withdraw.hash)
  await withdraw.wait();
  console.log("Withdrawed 1 aUSDC to L2 pooler");

  const launchBus = await poolerL2.connect(depositor).launchBus({
    value: ethers.utils.parseEther("0.45")
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
