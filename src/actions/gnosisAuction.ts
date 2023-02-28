import { Context, Event } from "@tenderly/actions";
import { recordReferralOnChainVine } from "./chainvine";
import {
  BOND_INTERFACE,
  EASY_AUCTION_INTERFACE,
  isTrackedAuction,
} from "./constants";
import {
  CANCELLATION_SELL_ORDER_TEMPLATE,
  NEW_SELL_ORDER_TEMPLATE,
  sendWebhook,
} from "./discord";
import { getMatchingEvent } from "./logParsing";
import {
  CancellationSellOrderEvent,
  ClaimedFromOrderEvent,
  NewSellOrderEvent,
  TransferEvent,
} from "./types";
import { getBondFactory, getResolvedTransactionEvent } from "./utils";

export const transfer = async (context: Context, event: Event) => {
  const transactionEvent = await getResolvedTransactionEvent(event, context);

  const claimedFromOrderEvent = await getMatchingEvent<ClaimedFromOrderEvent>(
    transactionEvent,
    EASY_AUCTION_INTERFACE,
    "ClaimedFromOrder"
  );

  const transferEvent = await getMatchingEvent<TransferEvent>(
    transactionEvent,
    BOND_INTERFACE,
    "Transfer"
  );

  const bondFactory = await getBondFactory(context);
  if (!(await bondFactory.isBond(transferEvent.address))) {
    throw new Error("bond not found");
  }

  const sentReferral = await recordReferralOnChainVine(
    context,
    transferEvent,
    claimedFromOrderEvent,
    transactionEvent.hash
  );

  await context.storage.putJson(sentReferral.wallet_address, sentReferral);
};

export const newSellOrder = async (context: Context, event: Event) => {
  const transactionEvent = await getResolvedTransactionEvent(event, context);

  const newSellOrderEvent = await getMatchingEvent<NewSellOrderEvent>(
    transactionEvent,
    EASY_AUCTION_INTERFACE,
    "NewSellOrder"
  );

  if (!isTrackedAuction(newSellOrderEvent.auctionId.toString())) {
    throw new Error("auction not tracked");
  }

  await sendWebhook(
    await context.secrets.get("AVOCADO_WEBHOOK_URL"),
    NEW_SELL_ORDER_TEMPLATE(transactionEvent, newSellOrderEvent)
  );
};

export const cancellationSellOrder = async (context: Context, event: Event) => {
  const transactionEvent = await getResolvedTransactionEvent(event, context);
  const cancellationSellOrderEvent =
    await getMatchingEvent<CancellationSellOrderEvent>(
      transactionEvent,
      EASY_AUCTION_INTERFACE,
      "CancellationSellOrder"
    );

  if (!isTrackedAuction(cancellationSellOrderEvent.auctionId.toString())) {
    throw new Error("auction not tracked");
  }

  await sendWebhook(
    await context.secrets.get("AVOCADO_WEBHOOK_URL"),
    CANCELLATION_SELL_ORDER_TEMPLATE(
      transactionEvent,
      cancellationSellOrderEvent
    )
  );
};
