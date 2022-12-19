import { Context, Event, Log, TransactionEvent } from "@tenderly/actions";
import { Contract, BigNumber } from "ethers";
import { recordReferralOnChainVine } from "./chainVine";
import {
  ARBOR_BOND_FACTORY,
  BOND_FACTORY_ABI,
  BOND_INTERFACE,
} from "./constants";
import { getProvider } from "./tenderly-api";
import { TransferEvent } from "./types";

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
