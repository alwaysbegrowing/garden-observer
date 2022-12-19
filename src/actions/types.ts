import { BigNumber } from "ethers";

export type TransferEvent = {
  bond: string;
  from: string;
  to: BigNumber;
  value: string;
};
