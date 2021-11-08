import { Currency, ETHERS, Token } from "@annex/sdk";

export function currencyId(currency, chainId) {
	if (currency === ETHERS[chainId]) return "ETH";
	if (currency instanceof Token) return currency.address;
	throw new Error("invalid currency");
}

export default currencyId;
