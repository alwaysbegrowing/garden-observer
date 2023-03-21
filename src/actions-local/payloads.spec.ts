import { config } from "dotenv";
import { TestRuntime } from "@tenderly/actions-test";

import { beforeAll, describe, expect, test } from 'vitest'

import { orderFilled } from "../actions/oneInch";
import {
  cancellationSellOrder,
  newSellOrder,
  transfer,
} from "../actions/gnosisAuction";

config();

describe('Test Payloads', () => {
  const testRuntime = new TestRuntime();
  beforeAll(() => {
    /*
      -->  Shove all of the .env variables into the test runtime.
      ---> Is there a problem shoving all of them in?
      ->   I hope not.
    */
    for (const [key, value] of Object.entries(process.env)) {
      if (value) {
        testRuntime.context.secrets.put(key, value);
      }
    }
  });
  describe('Track 1Inch Orders 🦄', () => {
    test.concurrent('a discord notification is sent when a tracked ERC-20 order is filled.', async () => {
      await testRuntime.execute(
        orderFilled,
        require("./payload/payload-order-filled.json")
      )
    })
    test.fails.concurrent('no notification is sent if the ERC-20 is not tracked.', async () => {
      expect(
        await testRuntime.execute(
          orderFilled,
          require("./payload/payload-order-filled-negative.json")
        )
      ).toThrowError();
    })
  })
  describe('Track Gnosis Auction Bids and Claims 📣', () => {
    describe('ChainVine Referrals', () => {
      test.concurrent('a referral is sent to ChainVine when claiming on the boundary.', async () => {
        await testRuntime.execute(
          /* 
            This example uses the old BondFactory because this condition only happened once on the Ribbon Bond.
            🎀
            Since the BondFactory address is hardcoded in the action, it needs to be changed.
            Would be nice to have it changable on this function somehow. 
          */
          transfer,
          require("./payload/payload-test-claim-boundary.json")
        )
      })
      test.concurrent('a referral is sent to ChainVine upon claming a tracked auction.', async () => {
        expect(
          await await testRuntime.execute(
            transfer,
            require("./payload/payload-test-claim.json")
          )
        );
      })
      test.fails.concurrent('no referral is sent if the auction is un-tracked.', async () => {
        expect(
          await testRuntime.execute(
            transfer,
            require("./payload/payload-test-claim-negative.json")
          )
        ).toThrowError();
      })
    })
    describe("Bids", () => {
      test.concurrent('sends a Discord notification with resolved ENS name when a bid has been placed on tracked auction.', async () => {
        await testRuntime.execute(
          newSellOrder,
          require("./payload/payload-test-bid-ens-name.json")
        )
      })
      test.concurrent('sends a Discord notification when a bid has been cancelled on a tracked auction.', async () => {
        await testRuntime.execute(
          cancellationSellOrder,
          require("./payload/payload-test-cancel.json")
        )
      })
    })
  })
});

