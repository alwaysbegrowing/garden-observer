import { TestRuntime, TestTransactionEvent } from "@tenderly/actions-test";
import { transfer } from "../actions/gnosisAuction";
/*
 * Running Web3 Actions code locally.
 * TestRuntime is a helper class that allows you to run the functions,
 * and set storage and secrets before running the function
 **/
const main = async () => {
  const testRuntime = new TestRuntime();

  testRuntime.context.secrets.put(
    "TENDERLY_API_KEY",
    "-WQVN07l2QmoLOJDgYKtV8-KvT9keRik"
  );
  testRuntime.context.secrets.put(
    "TENDERLY_GATEWAY_URL",
    "https://mainnet.gateway.tenderly.co/1hkLuGa16Wa4LGnjnfzqfM"
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
