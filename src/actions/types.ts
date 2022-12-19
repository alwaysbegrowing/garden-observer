import { BigNumber } from "ethers";

export type TransferEvent = {
  bond: string;
  from: string;
  to: string;
  value: BigNumber;
};
