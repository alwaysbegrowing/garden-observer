import { Context } from "@tenderly/actions";
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
