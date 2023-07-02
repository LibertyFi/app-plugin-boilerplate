import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, nano_models,SPECULOS_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";

// EDIT THIS: Replace with your contract address
const contractAddr = "0x429032A407aed3D5fF84caf38EFF217eB4d322A9".toLowerCase();
// EDIT THIS: Replace `boilerplate` with your plugin name
const pluginName = "libertify";
const testNetwork = "ethereum";
const abi_path = `../networks/${testNetwork}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

// Test from replayed transaction: https://etherscan.io/tx/0x0160b3aec12fd08e6be0040616c7c38248efb4413168a3372fc4d2db0e5961bb
// EDIT THIS: build your own test
nano_models.forEach(function(model) {
  jest.setTimeout(20000)
  test('[Nano ' + model.letter + '] Deposit Eth', zemu(model, async (sim, eth) => {

  // The rawTx of the tx up above is accessible through: https://etherscan.io/getRawTx?tx=0xb27a69cd3190ad0712da39f6b809ecc019ecbc319d3c17169853270226d18a8a
  const serializedTx = txFromEtherscan("0x02f8d9018085080c5fe7f885080c5fe7f883051a3294091630cd519791253ca0c54f69a7888ffed425878714d71d397e9e8ab8643b086d4d00000000000000000000000042775bc7fb67c10618da0a3c2c6cb068d027608300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000c001a052f69e568eae899911d7f8b583b2a634ea48bcdc8588b3ecf1cf77343cc9c30ba069eb714050a42b7b21e975c2c88f93555240c47c2eba763aaed316da776a85bc");

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
