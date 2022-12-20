import { formatUnits } from "ethers/lib/utils";
import { getConfig } from "./constants";
import { CancellationSellOrderEvent, NewSellOrderEvent } from "./types";
import axios from "axios";

export const NEW_SELL_ORDER_TEMPLATE = (newSellOrder: NewSellOrderEvent) => {
  const config = getConfig(newSellOrder);
  return {
    username: "Garden Observer 🔭🪴",
    embeds: [
      {
        author: {
          name: `${config.issuer} Auction Alert`,
          url: config.url,
          icon_url: config.iconUrl,
        },
        title: "🚀 Bid Placed",
        url: `https://app.arbor.finance/offerings/${newSellOrder.auctionId}`,
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
            value: `[${newSellOrder.transaction}](https://etherscan.io/tx/${newSellOrder.transaction})`,
            inline: false,
          },
        ],
      },
    ],
  };
};

export const CANCELLATION_SELL_ORDER_TEMPLATE = (
  cancellationSellOrder: CancellationSellOrderEvent
) => {
  const config = getConfig(cancellationSellOrder);
  return {
    username: "Garden Observer 🔭🪴",
    embeds: [
      {
        author: {
          name: `${config.issuer} Auction Alert`,
          url: config.url,
          icon_url: config.iconUrl,
        },
        title: "Bid cancelled",
        url: `https://app.arbor.finance/offerings/${cancellationSellOrder.auctionId}`,
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
            value: `[${cancellationSellOrder.transaction}](https://etherscan.io/tx/${cancellationSellOrder.transaction})`,
            inline: false,
          },
        ],
      },
    ],
  };
};

export const sendWebhook = async (webhookUrl: string, messageToSend: any) => {
  await axios.post(webhookUrl, messageToSend);
};
