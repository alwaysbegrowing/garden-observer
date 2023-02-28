import { Context, Event } from "@tenderly/actions";
import {
  BOND_INTERFACE,
  ONE_INCH_AGGREGATION_ROUTER_INTERFACE,
} from "./constants";
import { ORDER_FILLED_TEMPLATE, sendWebhook } from "./discord";
import { getMatchingEvent, getMatchingEvents } from "./logParsing";
import { OrderFilledEvent, TransferEvent } from "./types";
import { getBondFactory, getResolvedTransactionEvent } from "./utils";

export const orderFilled = async (context: Context, event: Event) => {
  const transactionEvent = await getResolvedTransactionEvent(event, context);
  const bondFactory = await getBondFactory(context);

  const orderFilledEvent = getMatchingEvent<OrderFilledEvent>(
    transactionEvent,
    ONE_INCH_AGGREGATION_ROUTER_INTERFACE,
    "OrderFilled"
  );

  const transferEvents = await getMatchingEvents<TransferEvent>(
    transactionEvent,
    BOND_INTERFACE,
    "Transfer"
  );

  let bondTransferEvent: TransferEvent;
  let tokenTransferEvent: TransferEvent;

  // I think there are two events here so if the first one is the bond transfer
  // then the second one is the token transfer and vice versa
  if (await bondFactory.isBond(transferEvents[0].address)) {
    bondTransferEvent = transferEvents[0];
    tokenTransferEvent = transferEvents[1];
  } else {
    tokenTransferEvent = transferEvents[0];
    bondTransferEvent = transferEvents[1];
  }

  await sendWebhook(
    await context.secrets.get("AVOCADO_WEBHOOK_URL"),
    ORDER_FILLED_TEMPLATE(
      orderFilledEvent,
      bondTransferEvent,
      tokenTransferEvent,
      transactionEvent.hash
    )
  );
};
