import { TestRuntime } from "@tenderly/actions-test";
import {
  cancellationSellOrder,
  newSellOrder,
  transfer,
} from "../actions/gnosisAuction";
import { config } from "dotenv";
config();
/*
 * Running Web3 Actions code locally.
 * TestRuntime is a helper class that allows you to run the functions,
 * and set storage and secrets before running the function
 **/
const main = async () => {
  const testRuntime = new TestRuntime();
  [
    "TENDERLY_API_KEY",
    "TENDERLY_GATEWAY_URL",
    "CHAINVINE_API_KEY",
    "AVOCADO_WEBHOOK_URL",
  ].forEach((variable) =>
    testRuntime.context.secrets.put(variable, process.env[variable] || "")
  );
  try {
    await testRuntime.execute(
      transfer,
      require("./payload/payload-test-claim.json")
    );
    await testRuntime.execute(
      newSellOrder,
      require("./payload/payload-test-bid.json")
    );
    await testRuntime.execute(
      cancellationSellOrder,
      require("./payload/payload-test-cancel.json")
    );
  } catch (e) {
    console.log(e);
  }
};

(async () => await main())();
