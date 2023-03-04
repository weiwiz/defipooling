const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

// Tests that can be ran without forking
describe("WithoutFork", function () {
  async function deployFixture() {
    const [user, otherUser, thirdUser] = await ethers.getSigners();

    const USDC = await ethers.getContractFactory("ExampleERC20");
    const usdc = await USDC.deploy("USD Coin", "USDC");

    // const PUSDC = await ethers.getContractFactory("FUSDC");
    // const pusdc = await PUSDC.deploy("Flux USDC", "FUSDC");

    // const Gateway = await ethers.getContractFactory("GatewayL2");
    // const gateway = await Gateway.deploy(user.address); //replace with gateway
    
    const PoolerL2 = await ethers.getContractFactory("PoolerL2");
    const poolerL2 = await PoolerL2.deploy(usdc.address); //replace with gateway

    // const PoolerL1 = await ethers.getContractFactory("PoolerL1");
    // const poolerL1 = await PoolerL1.deploy(usdc.address, user.address, 300); //replace with gateway
    
    return { user, otherUser, thirdUser, usdc, poolerL2 };
  }

  describe("Deposit", function () {
    it("Should be able to deposit", async function () {
      const { user, usdc, poolerL2 } = await loadFixture(deployFixture);

      await usdc.approve(poolerL2.address, 1000000);
      await poolerL2.deposit(1000000);

      expect(await poolerL2.depositsWaiting(user.address)).to.equal(995000);
      expect(await poolerL2.feeBucket()).to.equal(5000);
    });

    it("Should be able to cancel deposits", async function () {
      const { user, usdc, poolerL2 } = await loadFixture(deployFixture);

      await usdc.approve(poolerL2.address, 1000000);
      await poolerL2.deposit(1000000);

      await poolerL2.cancelDeposit();
      
      expect(await poolerL2.feeBucket()).to.equal(0);
      expect(await poolerL2.depositsWaiting(user.address)).to.equal(0);
      expect(await usdc.balanceOf(user.address)).to.equal("100000000");
    });
  });

  describe("Withdraw", function () {
    it("Should be able to withdraw", async function () {
      const { user, poolerL2 } = await loadFixture(deployFixture);

      await poolerL2.approve(poolerL2.address, 1000000);
      await poolerL2.withdraw(1000000);

      expect(await poolerL2.withdrawsWaiting(user.address)).to.equal(1000000);
    });

    it("Should be able to cancel withdraws", async function () {
      const { user, usdc, poolerL2 } = await loadFixture(deployFixture);

      await poolerL2.approve(poolerL2.address, 1000000);
      await poolerL2.withdraw(1000000);

      await poolerL2.cancelWithdraw();
      
      expect(await poolerL2.feeBucket()).to.equal(0);
      expect(await poolerL2.withdrawsWaiting(user.address)).to.equal(0);
      expect(await poolerL2.balanceOf(user.address)).to.equal("10000000000");
    });
  });
});


// L2 tests that have to be ran on mumbai fork
describe("LocalForkL2", function () {
  async function deployFixture() {
    const [deployer, otherUser, thirdUser] = await ethers.getSigners();

    const user = new ethers.Wallet(process.env.PKEY, ethers.provider);

    const usdcAddress = "0x2c852e740B62308c46DD29B982FBb650D063Bd07";
    const axelarAddress = "0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B";
    const destinationChain = "ethereum-2";
    const symbol = "aUSDC";
    const gasService = "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6";
  
    const usdc = await ethers.getContractAt("USDC", usdcAddress)

    const PoolerL2 = await ethers.getContractFactory("PoolerL2");
    const poolerL2 = await PoolerL2.deploy(usdc.address);

    const GateL2 = await ethers.getContractFactory("GateL2");
    const gateL2 = await GateL2.deploy(
      axelarAddress,
      destinationChain,
      symbol,
      usdcAddress,
      poolerL2.address,
      poolerL2.address,
      gasService
    );
    await poolerL2.setGateAddress(gateL2.address);
    
    return { user, otherUser, thirdUser, usdc, deployer, poolerL2, gateL2 };
  }

  describe("Full Ride", function () {
    it("Should be able to do a full ride with one deposit and one withdrawal", async function () {
      const { user, otherUser, thirdUser, usdc, poolerL2, gateL2 } = await loadFixture(deployFixture);

      // user has 100 USDC, makes deposit request for 10
      await usdc.connect(user).approve(poolerL2.address, 10000000);
      await poolerL2.connect(user).deposit(10000000);
      
      expect(await poolerL2.depositsWaiting(user.address)).to.equal(9950000);
      expect(await poolerL2.feeBucket()).to.equal(50000);
      expect(await poolerL2.depositQueue(0)).to.equal(user.address);
      
      // otherUser has 100 pUSDC, makes withdraw request for 10
      await poolerL2.connect(otherUser).withdraw(1000000000);
      
      expect(await poolerL2.withdrawsWaiting(otherUser.address)).to.equal(1000000000);
      expect(await poolerL2.withdrawQueue(0)).to.equal(otherUser.address);
      
      // mocking bus going
      await poolerL2.connect(thirdUser).launchBus();
      
      expect(await poolerL2.rideOngoing()).to.equal(true);
      expect(await poolerL2.driver()).to.equal(thirdUser.address);
      
      const gateSigner = await impersonateAddress(gateL2.address);
      await user.sendTransaction({to: gateSigner.address, value: "100000000000000000"})
      const driverL1Address = "0xE6E4b6a802F2e0aeE5676f6010e0AF5C9CDd0a50"
      
      // bus is coming back with aUSDC from withdrawal
      await usdc.connect(user).transfer(poolerL2.address, 20000000)
      await poolerL2.connect(gateSigner).finalizeUnwarp(
        1990000000, // 20 fUSDC have been minted
        driverL1Address
        );
        
      expect(await poolerL2.rideOngoing()).to.equal(false);
        
      // drivers were paid
      expect(await usdc.balanceOf(thirdUser.address)).to.equal(50000 / 2);
      expect(await usdc.balanceOf(driverL1Address)).to.equal(50000 / 2);

      expect(await poolerL2.balanceOf(user.address)).to.equal(9950000 * 2 * 100);
      expect(await poolerL2.depositsWaiting(user.address)).to.equal(0);
      expect(await poolerL2.depositQueueLength()).to.equal(0);
      
      expect(await usdc.balanceOf(otherUser.address)).to.equal(20000000);
      expect(await poolerL2.withdrawsWaiting(otherUser.address)).to.equal(0);
      expect(await poolerL2.withdrawQueueLength()).to.equal(0);
    });
  })
})

// L1 tests that have to be ran on goerli fork
describe("LocalForkL1", function () {
  async function deployFixture() {
    const [deployer, otherUser, thirdUser] = await ethers.getSigners();

    const user = new ethers.Wallet(process.env.PKEY, ethers.provider);
    
    const usdcAddress = "0x254d06f33bDc5b8ee05b2ea472107E300226659A";
    const axelarAddress = "0xe432150cce91c13a887f7D836923d5597adD8E31";
    const l2GateAddress = "0xe432150cce91c13a887f7D836923d5597adD8E31"; // arbitrary
    const destinationChain = "Polygon";
    const symbol = "aUSDC";
    const gasService = "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6";
    // const cTokenAddress = "0x73506770799Eb04befb5AaE4734e58C2C624F493"

    const Vault = await ethers.getContractFactory("VaultL1");
    const vault = await Vault.deploy("Flux USDC Test", "fUSDC", usdcAddress);
  
    const usdc = await ethers.getContractAt("USDC", usdcAddress)

    const PoolerL1 = await ethers.getContractFactory("PoolerL1");
    const poolerL1 = await PoolerL1.deploy(usdc.address, vault.address, 300);

    const GateL1 = await ethers.getContractFactory("GateL1");
    const gateL1 = await GateL1.deploy(
      axelarAddress,
      destinationChain,
      symbol,
      l2GateAddress,
      usdcAddress,
      poolerL1.address,
      poolerL1.address,
      gasService
    );
    await poolerL1.setGateAddress(gateL1.address);
    
    return { user, otherUser, thirdUser, usdc, deployer, poolerL1, gateL1, vault };
  }

  describe("Deposit", function () {
    it("Should be able to do a full ride", async function () {
      const { user, otherUser, thirdUser, usdc, poolerL1, gateL1, vault } = await loadFixture(deployFixture);

      await user.sendTransaction({to: gateL1.address, value: "100000000000000000"})

      // bus is coming with aUSDC from deposit
      const ausdcRichGuy = await impersonateAddress("0xF52bd269116448745a7e13C3d2f299973Cf671aB");
      await usdc.connect(ausdcRichGuy).transfer(poolerL1.address, 20000000)
      const gateSigner = await impersonateAddress(gateL1.address);
      // await usdc.transfer(poolerL1.address, 20000000);
      
      expect(await usdc.balanceOf(poolerL1.address)).to.equal(20000000);
      await poolerL1.connect(gateSigner).finalizeWarp(
        1000000, // 1 fUSDC has to be withdrawn
      );
      console.log('balance in fUSDC:', await vault.balanceOf(poolerL1.address))
        
      expect(await poolerL1.rideOngoing()).to.equal(true);
      // deposit and withdrawal has been done
      expect(await vault.balanceOf(poolerL1.address)).to.equal(19000000);


      // await poolerL1.connect(thirdUser).launchBus(thirdUser.address)


      // expect(await poolerL1.rideOngoing()).to.equal(false);
    });
  })
})

const impersonateAddress = async (address) => {
  const hre = require('hardhat');
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  });
  const signer = await ethers.provider.getSigner(address);
  signer.address = signer._address;
  return signer;
};
