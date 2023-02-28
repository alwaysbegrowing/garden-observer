import { Context, Event } from "@tenderly/actions";
import { BigNumber } from "ethers";
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
import { getMatchingEvent, getMatchingEvents } from "./logParsing";
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

  const transferEvents = await getMatchingEvents<TransferEvent>(
    transactionEvent,
    BOND_INTERFACE,
    "Transfer"
  );

  const bondFactory = await getBondFactory(context);

  let bondTransferEvent: TransferEvent | null = null;
  let tokenTransferEvent: TransferEvent | undefined = undefined;

  // If there is only one transfer event, it was a full fill
  if (transferEvents.length == 1) {
    if (await bondFactory.isBond(transferEvents[0].address)) {
      bondTransferEvent = transferEvents[0];
    }
  } else {
    // if there are two transfer events, that means that the person was on the
    // b o u n d a r y
    // of the auction, and got partially filled.
    if (await bondFactory.isBond(transferEvents[0].address)) {
      bondTransferEvent = transferEvents[0];
      tokenTransferEvent = transferEvents[1];
    } else if (await bondFactory.isBond(transferEvents[1].address)) {
      bondTransferEvent = transferEvents[1];
      tokenTransferEvent = transferEvents[0];
    }
  }
  if (!bondTransferEvent) {
    throw new Error("bond not found");
  }

  // to send to chainvine, we need to know the amount of USDC transferred and
  // subtract that from their original order amount
  let amount: BigNumber;
  if (tokenTransferEvent) {
    amount = claimedFromOrderEvent.sellAmount.sub(tokenTransferEvent.value);
  } else {
    amount = claimedFromOrderEvent.sellAmount;
  }
  const sentReferral = await recordReferralOnChainVine(
    context,
    transactionEvent.hash,
    amount,
    bondTransferEvent
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
