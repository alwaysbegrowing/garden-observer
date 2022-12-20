import { Context, Event, Log, TransactionEvent } from "@tenderly/actions";
import { Contract, BigNumber } from "ethers";
import { recordReferralOnChainVine } from "./chainVine";
import {
  ARBOR_BOND_FACTORY,
  BOND_FACTORY_ABI,
  BOND_INTERFACE,
  EASY_AUCTION_INTERFACE,
  isTrackedAuction,
} from "./constants";
import {
  CANCELLATION_SELL_ORDER_TEMPLATE,
  NEW_SELL_ORDER_TEMPLATE,
  sendWebhook,
} from "./discord";
import { getProvider } from "./tenderly-api";
import {
  CancellationSellOrderEvent,
  NewSellOrderEvent,
  TransferEvent,
} from "./types";

const getTransferEventFromLogs = async (logs: Log[], bondFactory: Contract) => {
  let foundTransferEvent: TransferEvent = {
    bond: "",
    from: "",
    to: "",
    value: BigNumber.from(0),
  };
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    try {
      const originatingEventAddress = log.address;

      const isBond = await bondFactory.isBond(originatingEventAddress);
      if (!isBond) continue;
      // Event comes from our bond factory

      const possibleTransferEvent = BOND_INTERFACE.parseLog(log);
      if (possibleTransferEvent.name !== "Transfer") continue;
      // Event is a transfer event
      foundTransferEvent.bond = log.address;
      foundTransferEvent.from = possibleTransferEvent.args["from"];
      foundTransferEvent.to = possibleTransferEvent.args["to"];
      foundTransferEvent.value = possibleTransferEvent.args["value"];
    } catch (e) {
      console.log(e);
    }
  }
  return foundTransferEvent;
};

const getNewSellOrderEventFromLogs = async (logs: Log[]) => {
  let foundNewSellOrderEvent: NewSellOrderEvent = {
    auctionId: "",
    userId: "",
    buyAmount: BigNumber.from(0),
    sellAmount: BigNumber.from(0),
  };
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    try {
      const possibleNewSellOrderEvent = EASY_AUCTION_INTERFACE.parseLog(log);
      if (possibleNewSellOrderEvent.name !== "NewSellOrder") continue;
      // Event is a newSellOrder event
      foundNewSellOrderEvent.auctionId =
        possibleNewSellOrderEvent.args["auctionId"];
      foundNewSellOrderEvent.userId = possibleNewSellOrderEvent.args["userId"];
      foundNewSellOrderEvent.buyAmount =
        possibleNewSellOrderEvent.args["buyAmount"];
      foundNewSellOrderEvent.sellAmount =
        possibleNewSellOrderEvent.args["sellAmount"];
    } catch (e) {
      console.log(e);
    }
  }
  return foundNewSellOrderEvent;
};

const getCancellationSellOrderEventFromLogs = async (logs: Log[]) => {
  let foundCancellationSellOrderEvent: CancellationSellOrderEvent = {
    auctionId: "",
    userId: "",
    buyAmount: BigNumber.from(0),
    sellAmount: BigNumber.from(0),
  };
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    try {
      const possibleCancellationSellOrderEvent =
        EASY_AUCTION_INTERFACE.parseLog(log);
      if (possibleCancellationSellOrderEvent.name !== "CancellationSellOrder")
        continue;
      // Event is a cancellationSellOrder event
      foundCancellationSellOrderEvent.auctionId =
        possibleCancellationSellOrderEvent.args["auctionId"];
      foundCancellationSellOrderEvent.userId =
        possibleCancellationSellOrderEvent.args["userId"];
      foundCancellationSellOrderEvent.buyAmount =
        possibleCancellationSellOrderEvent.args["buyAmount"];
      foundCancellationSellOrderEvent.sellAmount =
        possibleCancellationSellOrderEvent.args["sellAmount"];
    } catch (e) {
      console.log(e);
    }
  }
  return foundCancellationSellOrderEvent;
};

export const transfer = async (context: Context, event: Event) => {
  const transactionEvent = event as TransactionEvent;
  const provider = await getProvider(context);
  const bondFactory = new Contract(
    ARBOR_BOND_FACTORY,
    BOND_FACTORY_ABI,
    provider
  );
  const transferEvent = await getTransferEventFromLogs(
    transactionEvent.logs,
    bondFactory
  );
  if (
    transferEvent.bond === "" ||
    transferEvent.from === "" ||
    transferEvent.to === ""
  ) {
    return console.error("no transfer event found");
  }

  const requestToSend = await recordReferralOnChainVine(
    transferEvent,
    transactionEvent.hash
  );

  console.log(requestToSend);
  await context.storage.putJson("req", requestToSend);
};

export const newSellOrder = async (context: Context, event: Event) => {
  const transactionEvent = event as TransactionEvent;
  const newSellOrderEvent = await getNewSellOrderEventFromLogs(
    transactionEvent.logs
  );
  if (
    newSellOrderEvent.auctionId === "" ||
    newSellOrderEvent.userId === "" ||
    newSellOrderEvent.buyAmount === BigNumber.from(0) ||
    newSellOrderEvent.sellAmount === BigNumber.from(0)
  ) {
    return console.error("no newSellOrder event found");
  }

  if (!isTrackedAuction(newSellOrderEvent.auctionId.toString())) {
    return console.log("auction not tracked");
  }

  const newSellOrder: NewSellOrderEvent = {
    auctionId: newSellOrderEvent.auctionId.toString(),
    userId: newSellOrderEvent.userId.toString(),
    buyAmount: newSellOrderEvent.buyAmount,
    sellAmount: newSellOrderEvent.sellAmount,
    address: transactionEvent.from,
    transaction: transactionEvent.hash,
  };

  await sendWebhook(NEW_SELL_ORDER_TEMPLATE(newSellOrder));
};

export const cancellationSellOrder = async (context: Context, event: Event) => {
  const transactionEvent = event as TransactionEvent;
  const cancellationSellOrderEvent =
    await getCancellationSellOrderEventFromLogs(transactionEvent.logs);
  if (
    cancellationSellOrderEvent.auctionId === "" ||
    cancellationSellOrderEvent.userId === "" ||
    cancellationSellOrderEvent.buyAmount === BigNumber.from(0) ||
    cancellationSellOrderEvent.sellAmount === BigNumber.from(0)
  ) {
    return console.error("no cancellationSellOrder event found");
  }

  if (!isTrackedAuction(cancellationSellOrderEvent.auctionId.toString())) {
    return console.log("auction not tracked");
  }
  const cancellationSellOrder: CancellationSellOrderEvent = {
    auctionId: cancellationSellOrderEvent.auctionId.toString(),
    userId: cancellationSellOrderEvent.userId.toString(),
    buyAmount: cancellationSellOrderEvent.buyAmount,
    sellAmount: cancellationSellOrderEvent.sellAmount,
    address: transactionEvent.from,
    transaction: transactionEvent.hash,
  };
  await sendWebhook(CANCELLATION_SELL_ORDER_TEMPLATE(cancellationSellOrder));
};
