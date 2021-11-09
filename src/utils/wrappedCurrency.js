import { ETHERS, Token, TokenAmount, WETH } from "@annex/sdk";

export function wrappedCurrency(currency, chainId) {
	// eslint-disable-next-line no-nested-ternary
	return chainId && currency === ETHERS[chainId] ? WETH[chainId] : currency instanceof Token ? currency : undefined;
}

export function wrappedCurrencyAmount(
	currencyAmount,
	chainId
) {
	const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined;
	return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined;
}

export function unwrappedToken(token) {
	if (token.equals(WETH[token.chainId])) return ETHERS[token.chainId];
	return token;
}
