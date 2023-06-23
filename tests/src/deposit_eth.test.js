import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, nano_models,SPECULOS_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";

// EDIT THIS: Replace with your contract address
const contractAddr = "0x429032A407aed3D5fF84caf38EFF217eB4d322A9".toLowerCase();
// EDIT THIS: Replace `boilerplate` with your plugin name
const pluginName = "boilerplate";
const testNetwork = "ethereum";
const abi_path = `../networks/${testNetwork}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

// Test from replayed transaction: https://etherscan.io/tx/0x0160b3aec12fd08e6be0040616c7c38248efb4413168a3372fc4d2db0e5961bb
// EDIT THIS: build your own test
nano_models.forEach(function(model) {
  jest.setTimeout(20000)
  test('[Nano ' + model.letter + '] Deposit Eth', zemu(model, async (sim, eth) => {

  // The rawTx of the tx up above is accessible through: https://etherscan.io/getRawTx?tx=0xb27a69cd3190ad0712da39f6b809ecc019ecbc319d3c17169853270226d18a8a
  const serializedTx = txFromEtherscan("0x02f8da014185053e3b756a85053e3b756a8303d44994429032a407aed3d5ff84caf38eff217eb4d322a98802472296e55f02d0b8643b086d4d0000000000000000000000009e97d9e1c8abc901c0a7de2b90685a80c8c291c500000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000c080a0325b60ba827e714a30157213f8218b2a0077a6684f9efc51fce6a901e06989bca014e22bbb7406b1550923dabe3137d46a9584cfcd5b38a8991c4d9ab10a4a1b20");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

      //const right_clicks = model.letter === 'S' ? 12 : 6;
      const right_clicks = model.letter === 'S' ? 11 : 5;

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button `right_clicks` times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', model.name + '_deposit_eth', [right_clicks, 0]);

  await tx;
  }));
});
