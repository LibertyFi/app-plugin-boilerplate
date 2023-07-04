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
  return;
  
  jest.setTimeout(20000)
  test('[Nano ' + model.letter + '] Redeem Eth', zemu(model, async (sim, eth) => {

  // The rawTx of the tx up above is accessible through: https://etherscan.io/getRawTx?tx=0xb27a69cd3190ad0712da39f6b809ecc019ecbc319d3c17169853270226d18a8a
  const serializedTx = txFromEtherscan("0x02f901120101850846a28e54850846a28e5483024f5e94091630cd519791253ca0c54f69a7888ffed4258780b8a4d24febcd0000000000000000000000000000000000000000000000000ddd2935029d800000000000000000000000000042775bc7fb67c10618da0a3c2c6cb068d027608300000000000000000000000042775bc7fb67c10618da0a3c2c6cb068d027608300000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000c001a08c5bb6e6948a698ffc9c5be5a042593c8d218208fbc8f9e2628f44584dd9d31ba02b56c43afa56002aedf335233403d84fdc359c7e3ec8f6d82ad3952723b13698");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  const right_clicks = model.letter === 'S' ? 12 : 6;
      
  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button `right_clicks` times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', model.name + '_redeem_eth', [right_clicks, 0]);

  await tx;
  }));
});
