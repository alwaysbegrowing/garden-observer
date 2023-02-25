import { ChainvineClient } from "@chainvine/sdk";
import { ReferralEvent } from "@chainvine/sdk/lib/types";
import { Context } from "@tenderly/actions";
import { formatUnits } from "ethers/lib/utils";
import { isDev } from "./constants";
import { ClaimedFromOrderEvent, TransferEvent } from "./types";

export const recordReferralOnChainVine = async (
  context: Context,
  transferEvent: TransferEvent,
  claimedFromOrderEvent: ClaimedFromOrderEvent,
  transactionHash: string
) => {
  const amount = claimedFromOrderEvent.sellAmount.toString();

  // This is the assumed value of the bond. We could get this from the auction price, but the only reason we need this is to fulfil ChainVine's minimum USD amount. So assuming the bond is a little more than it actually cost is OK.
  const usdValue = 1;
  const referral: ReferralEvent = {
    // wallet_address - string - The claimer’s Ethereum wallet address
    wallet_address: transferEvent.to,
    // amount - number - The amount of tokens transferred
    amount: Number(formatUnits(amount, 6)),
    // token_address - string - The address of the transferred token
    token_address: transferEvent.address,
    // transaction_hash - string - The optional transaction hash for the transfer
    transaction_hash: transactionHash,
    // external_identifier - string - An optional identifier referencing a campaign, project, product, etc. should you wish to track this referral against data your side
    external_identifier: "testing-arbor-finance",
    // usd_value - number - The USD value of the token at the time of the event.
    usd_value: Number(usdValue),
  };

  if (isDev) {
    console.log("Would have sent referral to ChainVine", referral);
    return referral;
  }

  const chainVineClient = new ChainvineClient({
    apiKey: await context.secrets.get("CHAINVINE_API_KEY"),
    testMode: false,
  });

  const response = await chainVineClient.referralConversion(referral);
  if (response) {
    return referral;
  } else {
    throw new Error("Failed to send referral to ChainVine");
  }
};
