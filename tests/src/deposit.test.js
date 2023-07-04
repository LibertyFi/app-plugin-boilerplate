import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, nano_models,SPECULOS_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";

// EDIT THIS: Replace with your contract address
const contractAddr = "0xb19d68cc120C5139bb83E3b8C11CB4D421eEA98D".toLowerCase();
// EDIT THIS: Replace `boilerplate` with your plugin name
const pluginName = "libertify";
const testNetwork = "polygon";
const abi_path = `../networks/${testNetwork}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

// Test from replayed transaction: https://etherscan.io/tx/0x0160b3aec12fd08e6be0040616c7c38248efb4413168a3372fc4d2db0e5961bb
// EDIT THIS: build your own test
/*
nano_models.forEach(function(model) {
  jest.setTimeout(20000)
  test('[Nano ' + model.letter + '] Deposit', zemu(model, async (sim, eth) => {

  // The rawTx of the tx up above is accessible through: https://etherscan.io/getRawTx?tx=0xb27a69cd3190ad0712da39f6b809ecc019ecbc319d3c17169853270226d18a8a
  const serializedTx = txFromEtherscan("0x02f8f2013f85045577b48f85045577b48f8305403f94a642dae67eeddbf43ebc949e4ff9136da96fcde780b884faa9bce90000000000000000000000000000000000000000000000000031f43b66074c7a0000000000000000000000009e97d9e1c8abc901c0a7de2b90685a80c8c291c500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000c001a0e775dabac0cdbb87be2657673ad19da2558d22a5ae88d0d410823b25e815bbc4a05e9fd4aea34279651eaed9e4bb123768a49507caee22abf2f4a0bae3755485fa");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  const right_clicks = model.letter === 'S' ? 11 : 5;

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button `right_clicks` times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', model.name + '_deposit', [right_clicks, 0]);

  await tx;
  }));
});
*/

// Test from constructed transaction
// EDIT THIS: build your own test
nano_models.forEach(function(model) {
  jest.setTimeout(20000)
  test('[Nano ' + model.letter + '] Deposit', zemu(model, async (sim, eth) => {
  const contract = new ethers.Contract(contractAddr, abi);

  const vault = "0x489c3bCE166b907355CcadEC2c8B90BB879c22C6";
    const token = "0xB5C064F955D8e7F38fE0460C556a72987494eE17";
    const assets = parseEther('10');

  // EDIT THIS: adapt the signature to your method
  // signature: swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
  // EDIT THIS: don't call `swapExactETHForTokens` but your own method and adapt the arguments.
  //const {data} = await contract.populateTransaction.swapExactETHForTokens(amountOutMin, path, beneficiary ,deadline);
  const {data} = await contract.populateTransaction.deposit(
    vault, token, assets, []
    );


  // Get the generic transaction template
  let unsignedTx = genericTx;
  // Modify `to` to make it interact with the contract
  unsignedTx.to = contractAddr;
  // Modify the attached data
  unsignedTx.data = data;
  // EDIT THIS: get rid of this if you don't wish to modify the `value` field.
  // Modify the number of ETH sent
  //unsignedTx.value = parseEther("0.1");

  // Create serializedTx and remove the "0x" prefix
  const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx
  );

  const right_clicks = model.letter === 'S' ? 7 : 5;

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 10 times, then pressing both buttons to accept the transaction.
  // EDIT THIS: modify `10` to fix the number of screens you are expecting to navigate through.
  await sim.navigateAndCompareSnapshots('.', model.name + '_deposit', [right_clicks, 0]);

  await tx;
  }));
});