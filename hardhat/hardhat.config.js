require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      // chainId: CHAIN_IDS.hardhat,
      forking: {
        // url: `https://rpc.ankr.com/polygon_mumbai`,
        url: `https://rpc.ankr.com/eth_goerli`,
      }
    },
    goerli: {
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: [process.env.PKEY]
    },
    mumbai: {
      url: "https://polygon-testnet.public.blastapi.io",
      accounts: [process.env.PKEY]
    }
  }
}
