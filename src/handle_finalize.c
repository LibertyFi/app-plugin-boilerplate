#include "libertify_plugin.h"

void handle_finalize(void *parameters)
{
    ethPluginFinalize_t *msg = (ethPluginFinalize_t *) parameters;
    context_t *context = (context_t *) msg->pluginContext;

    msg->uiType = ETH_UI_TYPE_GENERIC;

    switch (context->selectorIndex) {
        case DEPOSIT:
            msg->numScreens = 1;
            /* if (memcmp(msg->address, context->receiver, ADDRESS_LENGTH) != 0) {
                msg->numScreens++;
            } */
            break;
        case DEPOSIT_ETH:
            // EDIT THIS: Set the total number of screen you will need.
            msg->numScreens = 1;
            // EDIT THIS: Handle this case like you wish to (i.e. maybe no additional
            // screen needed?). If the beneficiary is NOT the sender, we will need an
            // additional screen to display it.
            if (memcmp(msg->address, context->receiver, ADDRESS_LENGTH) != 0) {
                msg->numScreens++;
            }
            break;
        case REDEEM_ETH:
            // shares, receiver (opt), owner (opt)
            msg->numScreens = 3;  // do all screens
                                  // FIXME replace with screen bitmap + screenIndex
            /* if (memcmp(msg->address, context->receiver, ADDRESS_LENGTH) != 0) { */
            /*     msg->numScreens++; */
            /* } */
            /* if (memcmp(msg->address, context->owner, ADDRESS_LENGTH) != 0) { */
            /*     msg->numScreens++; */
            /* } */
            break;
        default:
            PRINTF("Selector index: %d not supported\n", context->selectorIndex);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
    }

    // EDIT THIS: set `tokenLookup1` (and maybe `tokenLookup2`) to point to
    // token addresses you will info for (such as decimals, ticker...).
    // msg->tokenLookup1 = context->token_deposited;

    msg->result = ETH_PLUGIN_RESULT_OK;
}
