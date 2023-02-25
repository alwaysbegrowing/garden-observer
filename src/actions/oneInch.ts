import { Context, Event, TransactionEvent } from "@tenderly/actions";
import {
  BOND_INTERFACE,
  ONE_INCH_AGGREGATION_ROUTER_INTERFACE,
} from "./constants";
import { ORDER_FILLED_TEMPLATE, sendWebhook } from "./discord";
import { getMatchingEvent, getMatchingEvents } from "./logParsing";
import { OrderFilledEvent, TransferEvent } from "./types";
import { getBondFactory } from "./utils";

export const orderFilled = async (context: Context, event: Event) => {
  const transactionEvent = event as TransactionEvent;
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
  if (!transferEvents) return console.log("a transfer event is missing");
  const bondTransferEvent = await transferEvents.find(
    async ({ address }) => await bondFactory.isBond(address)
  );
  const tokenTransferEvent = await transferEvents.find(
    async ({ address }) => !(await bondFactory.isBond(address))
  );
  if (!bondTransferEvent || !tokenTransferEvent || !orderFilledEvent)
    return console.log("bond transfer event is missing");

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
