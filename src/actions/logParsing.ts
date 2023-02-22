import { Log, TransactionEvent } from "@tenderly/actions";
import { BigNumber, Contract } from "ethers";
import { BOND_INTERFACE, EASY_AUCTION_INTERFACE } from "./constants";
import {
  CancellationSellOrderEvent,
  ClaimedFromOrderEvent,
  NewSellOrderEvent,
  TransferEvent,
} from "./types";

export const getTransferEvent = async (logs: Log[], bondFactory: Contract) => {
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

  if (
    foundTransferEvent.bond === "" ||
    foundTransferEvent.from === "" ||
    foundTransferEvent.to === ""
  ) {
    throw new Error("no transfer event found, or bond not found");
  }
  return foundTransferEvent;
};

export const getNewSellOrderEvent = async (
  transactionEvent: TransactionEvent
) => {
  let foundNewSellOrderEvent: NewSellOrderEvent = {
    auctionId: "",
    userId: "",
    buyAmount: BigNumber.from(0),
    sellAmount: BigNumber.from(0),
  };
  for (let i = 0; i < transactionEvent.logs.length; i++) {
    const log = transactionEvent.logs[i];
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

  if (
    foundNewSellOrderEvent.auctionId === "" ||
    foundNewSellOrderEvent.userId === "" ||
    foundNewSellOrderEvent.buyAmount === BigNumber.from(0) ||
    foundNewSellOrderEvent.sellAmount === BigNumber.from(0)
  ) {
    throw new Error("no newSellOrder event found");
  }

  const newSellOrder: NewSellOrderEvent = {
    auctionId: foundNewSellOrderEvent.auctionId.toString(),
    userId: foundNewSellOrderEvent.userId.toString(),
    buyAmount: foundNewSellOrderEvent.buyAmount,
    sellAmount: foundNewSellOrderEvent.sellAmount,
    address: transactionEvent.from,
    transaction: transactionEvent.hash,
  };

  return newSellOrder;
};

export const getCancellationSellOrderEvent = async (
  transactionEvent: TransactionEvent
) => {
  let foundCancellationSellOrderEvent: CancellationSellOrderEvent = {
    auctionId: "",
    userId: "",
    buyAmount: BigNumber.from(0),
    sellAmount: BigNumber.from(0),
  };
  for (let i = 0; i < transactionEvent.logs.length; i++) {
    const log = transactionEvent.logs[i];
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
  if (
    foundCancellationSellOrderEvent.auctionId === "" ||
    foundCancellationSellOrderEvent.userId === "" ||
    foundCancellationSellOrderEvent.buyAmount === BigNumber.from(0) ||
    foundCancellationSellOrderEvent.sellAmount === BigNumber.from(0)
  ) {
    throw new Error("no cancellationSellOrder event found");
  }

  const cancellationSellOrder: CancellationSellOrderEvent = {
    auctionId: foundCancellationSellOrderEvent.auctionId.toString(),
    userId: foundCancellationSellOrderEvent.userId.toString(),
    buyAmount: foundCancellationSellOrderEvent.buyAmount,
    sellAmount: foundCancellationSellOrderEvent.sellAmount,
    address: transactionEvent.from,
    transaction: transactionEvent.hash,
  };
  return cancellationSellOrder;
};

export const getClaimedFromOrderEvent = async (
  transactionEvent: TransactionEvent
) => {
  let foundClaimedFromOrderEvent: ClaimedFromOrderEvent = {
    auctionId: "",
    userId: "",
    buyAmount: BigNumber.from(0),
    sellAmount: BigNumber.from(0),
  };
  for (let i = 0; i < transactionEvent.logs.length; i++) {
    const log = transactionEvent.logs[i];
    try {
      const possibleClaimedFromOrderEvent =
        EASY_AUCTION_INTERFACE.parseLog(log);
      if (possibleClaimedFromOrderEvent.name !== "ClaimedFromOrder") continue;
      // Event is a ClaimedFromOrder event
      foundClaimedFromOrderEvent.auctionId =
        possibleClaimedFromOrderEvent.args["auctionId"];
      foundClaimedFromOrderEvent.userId =
        possibleClaimedFromOrderEvent.args["userId"];
      foundClaimedFromOrderEvent.buyAmount =
        possibleClaimedFromOrderEvent.args["buyAmount"];
      foundClaimedFromOrderEvent.sellAmount =
        possibleClaimedFromOrderEvent.args["sellAmount"];
    } catch (e) {
      console.log(e);
    }
  }
  if (
    foundClaimedFromOrderEvent.auctionId === "" ||
    foundClaimedFromOrderEvent.userId === "" ||
    foundClaimedFromOrderEvent.buyAmount === BigNumber.from(0) ||
    foundClaimedFromOrderEvent.sellAmount === BigNumber.from(0)
  ) {
    throw new Error("no ClaimedFromOrder event found");
  }

  const claimedFromOrder: ClaimedFromOrderEvent = {
    auctionId: foundClaimedFromOrderEvent.auctionId.toString(),
    userId: foundClaimedFromOrderEvent.userId.toString(),
    buyAmount: foundClaimedFromOrderEvent.buyAmount,
    sellAmount: foundClaimedFromOrderEvent.sellAmount,
    address: transactionEvent.from,
    transaction: transactionEvent.hash,
  };
  return claimedFromOrder;
};
