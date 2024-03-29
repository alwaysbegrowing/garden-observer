import { utils } from "ethers";

import { abi as BondAbi } from "./abis/bond.json";
import { abi as BondFactoryAbi } from "./abis/bondFactory.json";
import { abi as EasyAuctionAbi } from "./abis/easyAuction.json";
import { abi as AggregationRouter } from "./abis/aggregationRouter.json";

export const isDev = process.env.NODE_ENV === "development";

export const TENDERLY_PROJECT_SLUG = "arbor-finance";
export const TENDERLY_USERNAME = "namaskar_1f64f";

export const BOND_ABI = BondAbi;
export const BOND_FACTORY_ABI = BondFactoryAbi;
export const EASY_AUCTION_ABI = EasyAuctionAbi;
export const ONE_INCH_AGGREATION_ROUTER_ABI = AggregationRouter;

export const ARBOR_BOND_FACTORY = "0x1533Eb8c6cc510863b496D182596AB0e9E77A00c";
export const BOND_INTERFACE = new utils.Interface(BOND_ABI);

export const EASY_AUCTION = "0x0b7fFc1f4AD541A4Ed16b40D8c37f0929158D101";
export const EASY_AUCTION_INTERFACE = new utils.Interface(EASY_AUCTION_ABI);

export const ONE_INCH_AGGREGATION_ROUTER =
  "0x1111111254EEB25477B68fb85Ed929f73A960582";
export const ONE_INCH_AGGREGATION_ROUTER_INTERFACE = new utils.Interface(
  ONE_INCH_AGGREATION_ROUTER_ABI
);

const SHAPESHIFT_AUCTION_ONE = {
  bond: "0x2e2a42fbe7c7e2ffc031baf7442dbe1f8957770a",
  issuer: "ShapeShift",
  url: "https://shapeshift.com/",
  iconUrl: "https://assets.coingecko.com/coins/images/9988/small/FOX.png",
  bondName: "FOX CONVERT 2023-12-21 0.16C USDC",
  auctionId: "399",
};

const SHAPESHIFT_AUCTION_TWO = {
  bond: "0xb014af8824028efc93bc076506751786807a2cf8",
  issuer: "ShapeShift",
  url: "https://shapeshift.com/",
  iconUrl: "https://assets.coingecko.com/coins/images/9988/small/FOX.png",
  bondName: "FOX SIMPLE 2024-03-06 USDC",
  auctionId: "443",
};

const ICHI_AUCTION = {
  bond: "0x8dfbe438df77a658627dc808a45b3a9616d4fc73",
  issuer: "Ichi",
  url: "https://ichi.org/",
  iconUrl:
    "https://assets.coingecko.com/coins/images/13119/small/ICHI_(Round).jpg",
  bondName: "ICHI SIMPLE 2023-07-19 USDC",
  auctionId: "479",
};

const BORROWER_MAP: { [key: string]: typeof SHAPESHIFT_AUCTION_ONE } = {
  "399": SHAPESHIFT_AUCTION_ONE,
  "0x2e2a42fbe7c7e2ffc031baf7442dbe1f8957770a": SHAPESHIFT_AUCTION_ONE,
  "443": SHAPESHIFT_AUCTION_TWO,
  "0xb014af8824028efc93bc076506751786807a2cf8": SHAPESHIFT_AUCTION_TWO,
  "479": ICHI_AUCTION,
  "0x8dfbe438df77a658627dc808a45b3a9616d4fc73": ICHI_AUCTION,
};

export const getConfig = (key: string) => {
  const config = BORROWER_MAP[key.toLowerCase()];
  if (!config) {
    console.error("no config found for key", key);
    throw new Error("no config found for auctionId");
  }
  return config;
};

export const isTrackedAuction = (auctionId: string) => {
  return Object.keys(BORROWER_MAP).includes(auctionId);
};
