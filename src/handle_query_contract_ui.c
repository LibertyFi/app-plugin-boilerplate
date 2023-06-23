#include "boilerplate_plugin.h"

// EDIT THIS: You need to adapt / remove the static functions (set_send_ui,
// set_receive_ui ...) to match what you wish to display.

// Set UI for the "Send" screen.
// EDIT THIS: Adapt / remove this function to your needs.
static void set_deposit_ui(ethQueryContractUI_t *msg)
{
    strlcpy(msg->title, "Deposit ETH", msg->titleLength);

    const uint8_t *eth_amount = msg->pluginSharedRO->txContent->value.value;
    uint8_t eth_amount_size = msg->pluginSharedRO->txContent->value.length;

    // Converts the uint256 number located in `eth_amount` to its string
    // representation and copies this to `msg->msg`.
    amountToString(eth_amount, eth_amount_size, WEI_TO_ETHER, "ETH", msg->msg, msg->msgLength);
}

// Set UI for "Beneficiary" screen.
// EDIT THIS: Adapt / remove this function to your needs.
static void set_receiver_ui(ethQueryContractUI_t *msg, context_t *context)
{
    strlcpy(msg->title, "Receiver", msg->titleLength);

    // Prefix the address with `0x`.
    msg->msg[0] = '0';
    msg->msg[1] = 'x';

    // We need a random chainID for legacy reasons with
    // `getEthAddressStringFromBinary`. Setting it to `0` will make it work with
    // every chainID :)
    uint64_t chainid = 0;

    // Get the string representation of the address stored in
    // `context->beneficiary`. Put it in `msg->msg`.
    getEthAddressStringFromBinary(
        context->receiver,
        msg->msg + 2,  // +2 here because we've already prefixed with '0x'.
        msg->pluginSharedRW->sha3,
        chainid);
    /* strcpy(&msg->msg[6], ".."); */
    /* strncpy(&msg->msg[8], &msg->msg[16], 4); */
    /* msg->msg[12] = '\0'; */
}

void handle_query_contract_ui(void *parameters)
{
    ethQueryContractUI_t *msg = (ethQueryContractUI_t *) parameters;
    context_t *context = (context_t *) msg->pluginContext;

    // msg->title is the upper line displayed on the device.
    // msg->msg is the lower line displayed on the device.

    // Clean the display fields.
    memset(msg->title, 0, msg->titleLength);
    memset(msg->msg, 0, msg->msgLength);

    msg->result = ETH_PLUGIN_RESULT_OK;

    // EDIT THIS: Adapt the cases for the screens you'd like to display.
    switch (msg->screenIndex) {
        case 0:
            set_deposit_ui(msg);
            break;
        case 1:
            set_receiver_ui(msg, context);
            break;
        // Keep this
        default:
            PRINTF("Received an invalid screenIndex\n");
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            return;
    }
}
