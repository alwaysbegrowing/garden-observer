import { Log } from "@tenderly/actions";
import { Interface } from "ethers/lib/utils";
import { ResolvedTransactionEvent } from "./utils";

export const getMatchingEvent = <Type>(
  transactionEvent: ResolvedTransactionEvent,
  iface: Interface,
  eventName: string
): Type => {
  const event = getMatchingEvents<Type>(
    transactionEvent,
    iface,
    eventName
  ).pop();
  if (!event) throw new Error("No matching event found");
  return event;
};

export const getMatchingEvents = <Type>(
  transactionEvent: ResolvedTransactionEvent,
  iface: Interface,
  eventName: string
): Type[] => {
  const matchingLogs = transactionEvent.logs.filter((log: Log) => {
    try {
      const possibleEvent = iface.parseLog(log);
      return possibleEvent.name === eventName;
    } catch (e) {
      return false;
    }
  });
  return matchingLogs.map((log) => {
    const event = iface.parseLog(log);
    return {
      ...event.args,
      address: log.address,
    } as Type;
  });
};
