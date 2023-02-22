import { BigNumber } from "ethers";

export type TransferEvent = {
  bond: string;
  from: string;
  to: string;
  value: BigNumber;
};

export type NewSellOrderEvent = {
  auctionId: string;
  userId: string;
  buyAmount: BigNumber;
  sellAmount: BigNumber;
  address?: string;
  transaction?: string;
};

export type CancellationSellOrderEvent = {
  auctionId: string;
  userId: string;
  buyAmount: BigNumber;
  sellAmount: BigNumber;
  address?: string;
  transaction?: string;
};

export type ClaimedFromOrderEvent = {
  auctionId: string;
  userId: string;
  buyAmount: BigNumber;
  sellAmount: BigNumber;
  address?: string;
  transaction?: string;
};
