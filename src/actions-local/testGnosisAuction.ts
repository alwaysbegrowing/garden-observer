import { TestRuntime, TestTransactionEvent } from "@tenderly/actions-test";
import { transfer } from "../actions/gnosisAuction";
/*
 * Running Web3 Actions code locally.
 * TestRuntime is a helper class that allows you to run the functions,
 * and set storage and secrets before running the function
 **/
const main = async () => {
  const testRuntime = new TestRuntime();

  testRuntime.context.secrets.put("meowmeow", "");

  await testRuntime.execute(
    transfer,
    require("./payload/payload-test-claim.json")
  );
};

(async () => await main())();
