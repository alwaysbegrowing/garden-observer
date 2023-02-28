import { Context, TransactionEvent, Event } from "@tenderly/actions";
import { Contract } from "ethers";
import { ARBOR_BOND_FACTORY, BOND_FACTORY_ABI } from "./constants";
import { getProvider } from "./tenderly-api";

export const getBondFactory = async (context: Context) => {
  const provider = await getProvider(context);
  const bondFactory = new Contract(
    ARBOR_BOND_FACTORY,
    BOND_FACTORY_ABI,
    provider
  );
  return bondFactory;
};

export const getResolvedAddress = async (context: Context, address: string) => {
  const provider = await getProvider(context);
  const resolvedAddress = (await provider.lookupAddress(address)) || address;
  return resolvedAddress;
};

export type ResolvedTransactionEvent = TransactionEvent & {
  resolvedFrom: string;
  resolvedTo?: string;
};

export const getResolvedTransactionEvent = async (
  event: Event,
  context: Context
) => {
  const resolvedTransactionEvent = event as ResolvedTransactionEvent;
  resolvedTransactionEvent.resolvedFrom = await getResolvedAddress(
    context,
    resolvedTransactionEvent.from
  );
  if (resolvedTransactionEvent.to) {
    resolvedTransactionEvent.resolvedTo = await getResolvedAddress(
      context,
      resolvedTransactionEvent.to
    );
  }
  return resolvedTransactionEvent;
};
