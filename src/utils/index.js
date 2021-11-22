import { getAddress } from "@ethersproject/address";
import {Contract} from "@ethersproject/contracts";
import {ROUTER_ADDRESS} from "../constants/swap";
import {ETHERS, Percent, JSBI, Token} from "@annex/sdk";
import { abi as IUniswapV2Router02ABI } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import {AddressZero} from "@ethersproject/constants";
import { BigNumber } from "@ethersproject/bignumber";

export { fillArray } from './fillArray';

export function isAddress(value) {
	try {
		return getAddress(value);
	} catch {
		return false;
	}
}

const EXPLORERS = {
	56: "https://bscscan.com",
	97: "https://testnet.bscscan.com",
	339: 'https://cronos.crypto.org/cassini/explorer/',
	25: 'https://cronos.crypto.org/explorer',
};

export function getEtherscanLink(chainId, data, type) {
	const prefix = `${EXPLORERS[chainId]}`;

	switch (type) {
		case "transaction": {
			return `${prefix}/tx/${data}`;
		}
		case "token": {
			return `${prefix}/token/${data}`;
		}
		case "block": {
			return `${prefix}/block/${data}`
		}
		case "address":
		default: {
			return `${prefix}/address/${data}`;
		}
	}
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address, chars = 4) {
	const parsed = isAddress(address);
	if (!parsed) {
		throw Error(`Invalid 'address' parameter '${address}'.`);
	}
	return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

// add 10%
export function calculateGasMargin(value) {
	return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000));
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num) {
	return new Percent(JSBI.BigInt(Math.floor(num)), JSBI.BigInt(10000));
}

export function calculateSlippageAmount(value, slippage) {
	if (slippage < 0 || slippage > 10000) {
		throw Error(`Unexpected slippage value: ${slippage}`);
	}
	return [
		JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
		JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
	];
}

// account is not optional
export function getSigner(library, account) {
	return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library, account) {
	return account ? getSigner(library, account) : library;
}

// account is optional
export function getContract(address, ABI, library, account) {
	if (!isAddress(address) || address === AddressZero) {
		throw Error(`Invalid 'address' parameter '${address}'.`);
	}

	return new Contract(address, ABI, getProviderOrSigner(library, account));
}

// account is optional
export function getRouterContract(chainId, library, account) {
	return getContract(ROUTER_ADDRESS[chainId], IUniswapV2Router02ABI, library, account);
}

export function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function isTokenOnList(defaultTokens, currency) {
	if (currency === ETHERS[currency.chainId]) return true;
	return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address]);
}

export function shortenAddressRender(address) {
	if (!address || typeof address !== "string") {
		return "";
	}
	return address.slice(0, 6) + "..." + address.slice(-4);
}
