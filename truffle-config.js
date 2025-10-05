// module.exports = {
//   networks: {
//     development: {
//       host: "127.0.0.1",
//       port: 7545,
//       network_id: "*"
//     }
//   },
//   solc: {
//     optimizer: {
//       enabled: true,
//       runs: 200
//     }
//   }
// }

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: "admit blame guess below bring sell mom kingdom hold price frequent subject"
        }, 
        providerOrUrl: `https://eth-sepolia.g.alchemy.com/v2/jfTO6J_tSX7mc0L9f9Ycv`,
        addressIndex: 1,
      }),
      network_id: 11155111,
      gas: 5500000,
      confirmations: 2,
      // numberOfAddresses: 1,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
  compilers: { solc: { version: "0.5.16" } }
};
