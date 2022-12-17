import { Context, Event, Log, TransactionEvent } from "@tenderly/actions";
import { utils } from "ethers";

const BOND_ABI = require("../abis/bond.json");
const BOND_INTERFACE = new utils.Interface(BOND_ABI);

const getTransferEventFromLogs = (logs: Log[]) => {
  let foundTransferEvent: { from: string; to: string; value: string };
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    try {
      console.log(`Bond event was found: ${log.address}.`);
      const possibleTransferEvent = BOND_INTERFACE.parseLog(log);
      if (possibleTransferEvent.name === "Transfer") {
        const from = possibleTransferEvent.args["from"];
        const to = possibleTransferEvent.args["to"];
        const value = possibleTransferEvent.args["value"];
        return { from, to, value };
      }
    } catch (e) {
      console.log(`Event not found in Bond ABI address: ${log.address}.`);
    }
  }
};

export const transfer = async (context: Context, event: Event) => {
  const transactionEvent = event as TransactionEvent;
  // Log so we can later see what's available in payload
  const transferEvent = getTransferEventFromLogs(transactionEvent.logs);
  if (!transferEvent) {
    return console.error("no transfer event found");
  }

  const requestToSend = await context.storage.getJson("req");
  // wallet_address - string - The claimer’s Ethereum wallet address
  // amount - number - The amount of tokens transferred
  // token_address - string - The address of the transferred token - if not provided we will assume ETH
  // transaction_hash - string - The optional transaction hash for the transfer
  // external_identifier - string - An optional identifier referencing a campaign, project, product, etc. should you wish to track this referral against data your side
  // usd_value - number - The USD value of the token at the time of the event.
  // If not provided, we will perform the lookup ourselves using coingecko.
  // We currently support USD lookups for ETH, ERC-20 tokens, and xDAI - if you are using any other token you will need to pass in a USD value or the event handler will fail.

  requestToSend[0] = {
    wallet_address: transferEvent.from,
    amount: transferEvent.value,
    token_address: transferEvent.to,
    transaction_hash: transactionEvent.hash,
    external_identifier: "arbor-finance",
  };
  await context.storage.putJson("req", requestToSend);
};
