import { BigNumber } from "ethers";

type Event = {
  address: string;
};

export interface TransferEvent extends Event {
  from: string;
  to: string;
  value: BigNumber;
}

export interface NewSellOrderEvent extends Event {
  auctionId: BigNumber;
  userId: BigNumber;
  buyAmount: BigNumber;
  sellAmount: BigNumber;
}

export interface CancellationSellOrderEvent extends Event {
  auctionId: BigNumber;
  userId: BigNumber;
  buyAmount: BigNumber;
  sellAmount: BigNumber;
}

export interface ClaimedFromOrderEvent extends Event {
  auctionId: string;
  userId: string;
  buyAmount: BigNumber;
  sellAmount: BigNumber;
}

export interface OrderFilledEvent extends Event {
  maker: string;
  orderHash: string;
  remaining: BigNumber;
  value: BigNumber;
}
