import { Context } from "@tenderly/actions";
import axios from "axios";
import { formatUnits } from "ethers/lib/utils";
import { TransferEvent } from "./types";

export const recordReferralOnChainVine = async (
  context: Context,
  transferEvent: TransferEvent,
  transactionHash: string
) => {
  const amount = transferEvent.value.toString();
  const usdValue = formatUnits(amount, 6).toString();
  const referral = {
    // wallet_address - string - The claimer’s Ethereum wallet address
    wallet_address: transferEvent.to,
    // amount - number - The amount of tokens transferred
    amount: formatUnits(amount, 6),
    // token_address - string - The address of the transferred token
    token_address: transferEvent.bond,
    // transaction_hash - string - The optional transaction hash for the transfer
    transaction_hash: transactionHash,
    // external_identifier - string - An optional identifier referencing a campaign, project, product, etc. should you wish to track this referral against data your side
    external_identifier: "arbor-finance",
    // usd_value - number - The USD value of the token at the time of the event.
    usd_value: usdValue,
  };
  if (await sendRequest(context, referral)) {
    return referral;
  } else {
    throw new Error("Failed to send referral to ChainVine");
  }
};

export const sendRequest = async (context: Context, referral: any) => {
  console.log(referral);
  const response = await axios.post(
    await context.secrets.get("CHAINVINE_EVENT_ENDPOINT"),
    referral,
    {
      headers: {
        "x-api-key": await context.secrets.get("CHAINVINE_API_KEY"),
      },
    }
  );
  return response.status === 200;
};
