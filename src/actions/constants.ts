import { utils } from "ethers";

import { abi as BondAbi } from "./abis/bond.json";
import { abi as BondFactoryAbi } from "./abis/bondFactory.json";

export const TENDERLY_PROJECT_SLUG = "arbor-finance";
export const TENDERLY_USERNAME = "namaskar_1f64f";

export const BOND_ABI = BondAbi;
export const BOND_FACTORY_ABI = BondFactoryAbi;

export const ARBOR_BOND_FACTORY = "0x1533Eb8c6cc510863b496D182596AB0e9E77A00c";
export const BOND_INTERFACE = new utils.Interface(BOND_ABI);
