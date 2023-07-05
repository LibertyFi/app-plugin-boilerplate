import Zemu, { DEFAULT_START_OPTIONS, DeviceModel } from '@zondax/zemu';
import Eth from '@ledgerhq/hw-app-eth';
import { generate_plugin_config } from './generate_plugin_config';
import { parseEther, parseUnits, RLP} from "ethers/lib/utils";

const transactionUploadDelay = 60000;

async function waitForAppScreen(sim) {
    await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot(), transactionUploadDelay);
}

const sim_options_nano = {
    ...DEFAULT_START_OPTIONS,
    logging: true,
    X11: true,
    startDelay: 5000,
    startText: 'is ready'
};

const Resolve = require('path').resolve;

const NANOS_ETH_PATH = Resolve('elfs/ethereum_nanos.elf');
const NANOSP_ETH_PATH = Resolve('elfs/ethereum_nanosp.elf');
const NANOX_ETH_PATH = Resolve('elfs/ethereum_nanox.elf');

const NANOS_PLUGIN_PATH = Resolve('elfs/plugin_nanos.elf');
const NANOSP_PLUGIN_PATH = Resolve('elfs/plugin_nanosp.elf');
const NANOX_PLUGIN_PATH = Resolve('elfs/plugin_nanox.elf');

const APP_PATH_NANOS = Resolve('elfs/ethereum_nanos.elf');
const APP_PATH_NANOX = Resolve('elfs/ethereum_nanox.elf');
const APP_PATH_NANOSP = Resolve('elfs/ethereum_nanosp.elf');

const PLUGIN_LIB_NANOS = { 'Libertify': Resolve('elfs/plugin_nanos.elf') };
const PLUGIN_LIB_NANOX = { 'Libertify': Resolve('elfs/plugin_nanox.elf') };
const PLUGIN_LIB_NANOSP = { 'Libertify': Resolve('elfs/plugin_nanosp.elf') };

const nano_models: DeviceModel[] = [
    { name: 'nanos', letter: 'S', path: NANOS_PLUGIN_PATH, eth_path: NANOS_ETH_PATH },
    { name: 'nanosp', letter: 'SP', path: NANOSP_PLUGIN_PATH, eth_path: NANOSP_ETH_PATH },
    { name: 'nanox', letter: 'X', path: NANOX_PLUGIN_PATH, eth_path: NANOX_ETH_PATH }
];


const SPECULOS_ADDRESS = '0xFE984369CE3919AA7BB4F431082D027B4F8ED70C';
const RANDOM_ADDRESS = '0xaaaabbbbccccddddeeeeffffgggghhhhiiiijjjj'


let genericTx = {
    nonce: Number(0),
    gasLimit: Number(21000),
    gasPrice: parseUnits('1', 'gwei'),
    value: parseEther('1'),
    chainId: 1,
    to: RANDOM_ADDRESS,
    data: null,
};

const TIMEOUT = 1000000;

// Generates a serializedTransaction from a rawHexTransaction copy pasted from etherscan.
function txFromEtherscan(rawTx) {
    // Remove 0x prefix
    rawTx = rawTx.slice(2);

    let txType = rawTx.slice(0, 2);
    if (txType == "02" || txType == "01") {
        // Remove "02" prefix
        rawTx = rawTx.slice(2);
    } else {
        txType = "";
    }

    let decoded = RLP.decode("0x" + rawTx);
    if (txType != "") {
        decoded = decoded.slice(0, decoded.length - 3); // remove v, r, s
    } else {
        decoded[decoded.length - 1] = "0x"; // empty
        decoded[decoded.length - 2] = "0x"; // empty
        decoded[decoded.length - 3] = "0x01"; // chainID 1
    }

    // Encode back the data, drop the '0x' prefix
    let encoded = RLP.encode(decoded).slice(2);

    // Don't forget to prepend the txtype
    return txType + encoded;
}

/**
 * Emulation of the device using zemu
 * @param {string} device name of the device to emulate (nanos, nanox)
 * @param {function} func
 * @param {boolean} signed the plugin is already signed
 * @returns {Promise}
 */
function zemu(device, func, testNetwork, signed = false) {
    return async () => {
      let sim_options = sim_options_nano;
      type model = {dev:IDeviceModel,plugin:any}
      let current_model: model;
      
      const models: model[] = [
        {dev:{ name : 'nanos', prefix: 'S' , path: APP_PATH_NANOS}, plugin: PLUGIN_LIB_NANOS},
        {dev:{ name : 'nanox', prefix: 'X' , path: APP_PATH_NANOX}, plugin: PLUGIN_LIB_NANOX},
        {dev:{ name : 'nanosp', prefix: 'SP' , path: APP_PATH_NANOSP}, plugin: PLUGIN_LIB_NANOSP}
    ]

      if (device === "nanos") {
        current_model = models[0]
      } else if (device === "nanox") {
        current_model = models[1]
      }else {
        current_model = models[2]
      }

      const sim = new Zemu(current_model.dev.path, current_model.plugin);

      try {
        await sim.start({ ...sim_options, model: current_model.dev.name });
        const transport = await sim.getTransport();
        const eth = new Eth(transport);

        if (!signed) {
          let config = generate_plugin_config(testNetwork);
          eth.setLoadConfig({
            pluginBaseURL: null,
            extraPlugins: config,
          });
        }
        await func(sim, eth);
      } finally {
        await sim.close();
      }
    };
}
module.exports = {
    zemu,
    waitForAppScreen,
    genericTx,
    nano_models,
    SPECULOS_ADDRESS,
    RANDOM_ADDRESS,
    txFromEtherscan,
}
