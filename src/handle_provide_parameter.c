#include "libertify_plugin.h"

static void handle_deposit(ethPluginProvideParameter_t *msg, context_t *context)
{
    if (context->go_to_offset) {
        if (msg->parameterOffset != context->offset + SELECTOR_SIZE) {
            return;
        }
        context->go_to_offset = false;
    }
    switch (context->next_param) {
        case VAULT:
            // copy_parameter(context->assets, msg->parameter, sizeof(context->assets));
            context->next_param = TOKEN;
            break;
        case TOKEN:
            copy_address(context->token, msg->parameter, sizeof(context->token));
            context->next_param = ASSETS;
            break;
        case ASSETS:
            copy_parameter(context->assets, msg->parameter, sizeof(context->assets));
            context->next_param = DATA_OFFSET;
            break;
        case DATA_OFFSET:
            context->next_param = DATA_LENGTH;
            break;
        case DATA_LENGTH:
            context->next_param = UNEXPECTED_PARAMETER;
            break;
        default:
            PRINTF("Param not supported: %d\n", context->next_param);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}

void handle_provide_parameter(void *parameters)
{
    ethPluginProvideParameter_t *msg = (ethPluginProvideParameter_t *) parameters;
    context_t *context = (context_t *) msg->pluginContext;
    // We use `%.*H`: it's a utility function to print bytes. You first give
    // the number of bytes you wish to print (in this case, `PARAMETER_LENGTH`)
    // and then the address (here `msg->parameter`).
    PRINTF("plugin provide parameter: offset %d\nBytes: %.*H\n",
           msg->parameterOffset,
           PARAMETER_LENGTH,
           msg->parameter);

    msg->result = ETH_PLUGIN_RESULT_OK;

    // EDIT THIS: adapt the cases and the names of the functions.
    switch (context->selectorIndex) {
        case DEPOSIT:
            handle_deposit(msg, context);
            break;
        default:
            PRINTF("Selector Index not supported: %d\n", context->selectorIndex);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}
