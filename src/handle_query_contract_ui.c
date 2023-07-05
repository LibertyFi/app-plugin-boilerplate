#include "libertify_plugin.h"

static void set_assets_ui(ethQueryContractUI_t *msg, context_t *context)
{
    strlcpy(msg->title, "Assets", msg->titleLength);

   uint8_t decimals = context->decimals;
    const char *ticker = context->ticker;

    // If the token look up failed, use the default network ticker along with the default decimals.
    if (!context->token_found) {
        PRINTF("--- TOKEN NOT FOUND\n");
        decimals = WEI_TO_ETHER;
        ticker = msg->network_ticker;
    } else {
        PRINTF("--- TOKEN FOUND\n");
    }

    amountToString(context->assets,
                   sizeof(context->assets),
                   decimals,
                   ticker,
                   msg->msg,
                   msg->msgLength);

    /* amountToString(context->assets,
                   sizeof(context->assets),
                   WEI_TO_ETHER,
                   "??",
                   msg->msg,
                   msg->msgLength); */
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
        case DEPOSIT:
            switch (msg->screenIndex) {
                case 0:
                    set_assets_ui(msg, context);
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
