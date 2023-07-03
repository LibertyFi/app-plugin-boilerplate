#include "libertify_plugin.h"

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

static void set_address_ui(ethQueryContractUI_t *msg,
                           /* context_t *context,  */ uint8_t *addr,
                           const char *title)  // int shortened?
{
    strlcpy(msg->title, title, msg->titleLength);

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
        addr,          // context->receiver,
        msg->msg + 2,  // +2 here because we've already prefixed with '0x'.
        msg->pluginSharedRW->sha3,
        chainid);

    // if (shortened) { ...
    /* strcpy(&msg->msg[6], ".."); */
    /* strncpy(&msg->msg[8], &msg->msg[16], 4); */
    /* msg->msg[12] = '\0'; */
}

static void set_shares_ui(ethQueryContractUI_t *msg, context_t *context)
{
    strlcpy(msg->title, "Shares", msg->titleLength);
    amountToString(context->shares,
                   sizeof(context->shares),
                   WEI_TO_ETHER,
                   "LP",
                   msg->msg,
                   msg->msgLength);
}

static void set_assets_ui(ethQueryContractUI_t *msg, context_t *context)
{
    strlcpy(msg->title, "Assets", msg->titleLength);
    amountToString(context->assets,
                   sizeof(context->assets),
                   WEI_TO_ETHER,
                   "??",
                   msg->msg,
                   msg->msgLength);
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

    switch (context->selectorIndex) {
        case DEPOSIT_ETH:
            switch (msg->screenIndex) {
                case 0:
                    set_deposit_ui(msg);
                    break;
                case 1:
                    set_receiver_ui(msg, context);
                    break;
                default:
                    PRINTF("Received an invalid screenIndex\n");
                    msg->result = ETH_PLUGIN_RESULT_ERROR;
                    return;
            }
            break;
        case REDEEM_ETH:
            switch (msg->screenIndex) {
                case 0:
                    set_shares_ui(msg, context);  // set_eth_value_ui(..., "shares", )
                                                  // set_value_ui(msg, context->shares, "Shares");
                    break;
                case 1:
                    // set_receiver_ui(msg, context);
                    set_address_ui(msg, context->receiver, "Receiver");
                    break;
                case 2:
                    // set_owner_ui(msg, context);
                    set_address_ui(msg, context->owner, "Owner");
                    break;
                default:
                    PRINTF("Received an invalid screenIndex\n");
                    msg->result = ETH_PLUGIN_RESULT_ERROR;
                    return;
            }
            break;
        case DEPOSIT:
            switch (msg->screenIndex) {
                case 0:
                    set_assets_ui(msg, context);
                    break;
                case 1:
                    set_address_ui(msg, context->receiver, "Receiver");
                    break;
                default:
                    PRINTF("Received an invalid screenIndex\n");
                    msg->result = ETH_PLUGIN_RESULT_ERROR;
                    return;
            }
            break;
        default:
            PRINTF("Selector Index not supported: %d\n", context->selectorIndex);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}
