import { Context, Event, TransactionEvent } from "@tenderly/actions";
import { Contract } from "ethers";
import { recordReferralOnChainVine } from "./chainvine";
import {
  ARBOR_BOND_FACTORY,
  BOND_FACTORY_ABI,
  isTrackedAuction,
} from "./constants";
import {
  CANCELLATION_SELL_ORDER_TEMPLATE,
  NEW_SELL_ORDER_TEMPLATE,
  sendWebhook,
} from "./discord";
import {
  getCancellationSellOrderEvent,
  getClaimedFromOrderEvent,
  getNewSellOrderEvent,
  getTransferEvent,
} from "./logParsing";
import { getProvider } from "./tenderly-api";
import { ClaimedFromOrderEvent, NewSellOrderEvent } from "./types";

export const transfer = async (context: Context, event: Event) => {
  const transactionEvent = event as TransactionEvent;
  const provider = await getProvider(context);
  const bondFactory = new Contract(
    ARBOR_BOND_FACTORY,
    BOND_FACTORY_ABI,
    provider
  );

  const claimedFromOrderEvent: ClaimedFromOrderEvent =
    await getClaimedFromOrderEvent(transactionEvent);

  const transferEvent = await getTransferEvent(
    transactionEvent.logs,
    bondFactory
  );

  const sentReferral = await recordReferralOnChainVine(
    context,
    transferEvent,
    claimedFromOrderEvent,
    transactionEvent.hash
  );

  await context.storage.putJson(sentReferral.wallet_address, sentReferral);
};

export const newSellOrder = async (context: Context, event: Event) => {
  const transactionEvent = event as TransactionEvent;
  const newSellOrderEvent: NewSellOrderEvent = await getNewSellOrderEvent(
    transactionEvent
  );

  if (!isTrackedAuction(newSellOrderEvent.auctionId.toString())) {
    return console.log("auction not tracked");
  }

  await sendWebhook(
    await context.secrets.get("AVOCADO_WEBHOOK_URL"),
    NEW_SELL_ORDER_TEMPLATE(newSellOrderEvent)
  );
};

export const cancellationSellOrder = async (context: Context, event: Event) => {
  const transactionEvent = event as TransactionEvent;
  const cancellationSellOrderEvent = await getCancellationSellOrderEvent(
    transactionEvent
  );

  if (!isTrackedAuction(cancellationSellOrderEvent.auctionId.toString())) {
    return console.log("auction not tracked");
  }
  await sendWebhook(
    await context.secrets.get("AVOCADO_WEBHOOK_URL"),
    CANCELLATION_SELL_ORDER_TEMPLATE(cancellationSellOrderEvent)
  );
};
