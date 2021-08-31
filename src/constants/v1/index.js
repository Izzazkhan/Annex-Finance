import { Interface } from "@ethersproject/abi";
import { ChainId } from "@annex/sdk";
import V1_EXCHANGE_ABI from "./v1_exchange.json";
import V1_FACTORY_ABI from "./v1_factory.json";

const V1_FACTORY_ADDRESSES = {
	[ChainId.MAINNET]: "0x6a616606D9f3BaE02d215db5046b7D1030674622",
	[ChainId.BSCTESTNET]: "0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F",
};

const V1_FACTORY_INTERFACE = new Interface(V1_FACTORY_ABI);
const V1_EXCHANGE_INTERFACE = new Interface(V1_EXCHANGE_ABI);

export { V1_FACTORY_ADDRESSES, V1_FACTORY_INTERFACE, V1_FACTORY_ABI, V1_EXCHANGE_INTERFACE, V1_EXCHANGE_ABI };
