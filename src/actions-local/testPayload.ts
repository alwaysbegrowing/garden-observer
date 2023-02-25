import { TestRuntime } from "@tenderly/actions-test";
import { orderFilled } from "../actions/oneInch";
import { config } from "dotenv";
import { assert } from "console";
import {
  cancellationSellOrder,
  newSellOrder,
  transfer,
} from "../actions/gnosisAuction";
config();

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

  /* 1inch */
  assert(
    await expectRunSuccess(
      testRuntime,
      orderFilled,
      require("./payload/payload-order-filled.json")
    )
  );
  assert(
    await expectRunFailure(
      testRuntime,
      orderFilled,
      require("./payload/payload-order-filled-negative.json")
    )
  );

  /* Gnosis Auction */
  // assert(
  //   await expectRunSuccess(
  //     testRuntime,
  //     transfer,
  //     require("./payload/payload-test-claim.json")
  //   )
  // );
  // assert(
  //   await expectRunSuccess(
  //     testRuntime,
  //     newSellOrder,
  //     require("./payload/payload-test-bid.json")
  //   )
  // );
  // assert(
  //   await expectRunSuccess(
  //     testRuntime,
  //     cancellationSellOrder,
  //     require("./payload/payload-test-cancel.json")
  //   )
  // );
  console.log("All tests passed");
};

const expectRunSuccess = async (
  testRuntime: TestRuntime,
  action: (context: any, event: any) => Promise<void>,
  payload: any
) => {
  try {
    await testRuntime.execute(action, payload);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const expectRunFailure = async (
  testRuntime: TestRuntime,
  action: (context: any, event: any) => Promise<void>,
  payload: any
) => {
  try {
    await testRuntime.execute(action, payload);
    return false;
  } catch (e) {
    return true;
  }
};

(async () => await main())();
