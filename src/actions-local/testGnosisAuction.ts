import { TestRuntime } from "@tenderly/actions-test";
import { transfer } from "../actions/gnosisAuction";
import { config } from "dotenv";
config();
/*
 * Running Web3 Actions code locally.
 * TestRuntime is a helper class that allows you to run the functions,
 * and set storage and secrets before running the function
 **/
const main = async () => {
  const testRuntime = new TestRuntime();
  testRuntime.context.secrets.put(
    "TENDERLY_API_KEY",
    process.env.TENDERLY_API_KEY || ""
  );
  testRuntime.context.secrets.put(
    "TENDERLY_GATEWAY_URL",
    process.env.TENDERLY_GATEWAY_URL || ""
  );
  try {
    await testRuntime.execute(
      transfer,
      require("./payload/payload-test-old-factory.json")
    );
  } catch (e) {
    console.log(e);
  }
};

(async () => await main())();
