import { formatUnits } from "ethers/lib/utils";
import { getConfig, isDev } from "./constants";
import {
  CancellationSellOrderEvent,
  NewSellOrderEvent,
  OrderFilledEvent,
  TransferEvent,
} from "./types";
import axios from "axios";
import { TransactionEvent } from "@tenderly/actions";

export const NEW_SELL_ORDER_TEMPLATE = (
  transactionEvent: TransactionEvent,
  newSellOrder: NewSellOrderEvent
) => {
  const config = getConfig(newSellOrder.auctionId.toString());
  return {
    username: "Garden Observer 🔭🪴",
    embeds: [
      {
        author: {
          name: `${config.issuer} Bond`,
          url: config.url,
          icon_url: config.iconUrl,
        },
        title: "🚀 Bid Placed",
        url: `https://app.arbor.finance/auctions/${newSellOrder.auctionId}`,
        color: 7728386,
        fields: [
          {
            name: "USDC",
            value: `${Number(
              formatUnits(newSellOrder.sellAmount, 6)
            ).toLocaleString()}`,
            inline: true,
          },
          {
            name: config.bondName,
            value: `${Number(
              formatUnits(newSellOrder.buyAmount, 6)
            ).toLocaleString()}`,
            inline: true,
          },
          {
            name: "Bidder",
            value: `(${newSellOrder.userId}) [${newSellOrder.address}](https://etherscan.io/address/${newSellOrder.address})`,
            inline: false,
          },
          {
            name: "Transaction",
            value: `[${transactionEvent.hash}](https://etherscan.io/tx/${transactionEvent.hash})`,
            inline: false,
          },
        ],
      },
    ],
  };
};

export const CANCELLATION_SELL_ORDER_TEMPLATE = (
  transactionEvent: TransactionEvent,
  cancellationSellOrder: CancellationSellOrderEvent
) => {
  const config = getConfig(cancellationSellOrder.auctionId.toString());
  return {
    username: "Garden Observer 🔭🪴",
    embeds: [
      {
        author: {
          name: `${config.issuer} Bond`,
          url: config.url,
          icon_url: config.iconUrl,
        },
        title: "Bid cancelled",
        url: `https://app.arbor.finance/auctions/${cancellationSellOrder.auctionId}`,
        color: 7728386,
        fields: [
          {
            name: "USDC",
            value: `${Number(
              formatUnits(cancellationSellOrder.sellAmount, 6)
            ).toLocaleString()}`,
            inline: true,
          },
          {
            name: config.bondName,
            value: `${Number(
              formatUnits(cancellationSellOrder.buyAmount, 6)
            ).toLocaleString()}`,
            inline: true,
          },
          {
            name: "Bidder",
            value: `(${cancellationSellOrder.userId}) [${cancellationSellOrder.address}](https://etherscan.io/address/${cancellationSellOrder.address})`,
            inline: false,
          },
          {
            name: "Transaction",
            value: `[${transactionEvent.hash}](https://etherscan.io/tx/${transactionEvent.hash})`,
            inline: false,
          },
        ],
      },
    ],
  };
};

export const ORDER_FILLED_TEMPLATE = (
  orderFilledEvent: OrderFilledEvent,
  bondTransferEvent: TransferEvent,
  tokenTransferEvent: TransferEvent,
  transactionHash: string
) => {
  if (!bondTransferEvent.address) return;
  const config = getConfig(bondTransferEvent.address);
  return {
    username: "Garden Observer 🔭🪴",
    embeds: [
      {
        author: {
          name: `${config.issuer} Bond`,
          url: config.url,
          icon_url: config.iconUrl,
        },
        title: "Order filled",
        url: `https://app.arbor.finance/auctions/${config.auctionId}`,
        color: 7728386,
        fields: [
          {
            name: "USDC",
            value: `${Number(
              formatUnits(tokenTransferEvent.value, 6)
            ).toLocaleString()}`,
            inline: true,
          },
          {
            name: config.bondName,
            value: `${Number(
              formatUnits(bondTransferEvent.value, 6)
            ).toLocaleString()}`,
            inline: true,
          },
          {
            name: "Maker",
            value: `[${orderFilledEvent.maker}](https://etherscan.io/address/${orderFilledEvent.maker})`,
            inline: false,
          },
          {
            name: "Transaction",
            value: `[${transactionHash}](https://etherscan.io/tx/${transactionHash})`,
            inline: false,
          },
        ],
        footer: {
          text: orderFilledEvent.remaining.eq(0)
            ? "✅ Completely Filled"
            : `🔜 ${formatUnits(orderFilledEvent.remaining, 6)} remaining`,
        },
      },
    ],
  };
};

export const sendWebhook = async (webhookUrl: string, messageToSend: any) => {
  isDev
    ? console.log(messageToSend)
    : await axios.post(webhookUrl, messageToSend);
};
