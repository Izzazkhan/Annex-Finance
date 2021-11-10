import { CurrencyAmount, ETHERS, JSBI } from "@annex/sdk";
import { MIN_ETH } from "../constants/swap";

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function maxAmountSpend(currencyAmount, chainId) {
	if (!currencyAmount) return undefined;
	if (currencyAmount.currency === ETHERS[chainId]) {
		if (JSBI.greaterThan(currencyAmount.raw, MIN_ETH)) {
			return CurrencyAmount.ether(JSBI.subtract(currencyAmount.raw, MIN_ETH));
		}
		return CurrencyAmount.ether(JSBI.BigInt(0));
	}
	return currencyAmount;
}

export default maxAmountSpend;
