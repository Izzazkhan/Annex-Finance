import { AddressZero } from "@ethersproject/constants";
import {
	currencyEquals,
	ETHER,
	JSBI,
	Pair,
	Percent,
	Route,
	Token,
	TokenAmount,
	Trade,
	TradeType,
	WETH,
} from "@pancakeswap-libs/sdk";
import { useMemo } from "react";
import { useAllTokens } from "../hooks/Tokens";
import { useV1FactoryContract } from "../hooks/useContract";
import { Version } from "../hooks/useToggledVersion";
import {
	NEVER_RELOAD,
	useSingleCallResult,
	useSingleContractMultipleData
} from "../core";
import { useETHBalances, useTokenBalance, useTokenBalances } from "../hooks/wallet";
import { useActiveWeb3React } from "../hooks";

export function useV1ExchangeAddress(tokenAddress) {
	const contract = useV1FactoryContract();

	const inputs = useMemo(() => [tokenAddress], [tokenAddress]);
	return useSingleCallResult(contract, "getExchange", inputs)?.result?.[0];
}

export class MockV1Pair extends Pair {
	constructor(etherAmount, tokenAmount) {
		super(tokenAmount, new TokenAmount(WETH[tokenAmount.token.chainId], etherAmount));
	}
}

function useMockV1Pair(inputCurrency) {
	const token = inputCurrency instanceof Token ? inputCurrency : undefined;

	const isWETH = Boolean(token && token.equals(WETH[token.chainId]));
	const v1PairAddress = useV1ExchangeAddress(isWETH ? undefined : token?.address);
	const tokenBalance = useTokenBalance(v1PairAddress, token);
	const ETHBalance = useETHBalances([v1PairAddress])[v1PairAddress || ""];

	return useMemo(
		() =>
			token && tokenBalance && ETHBalance && inputCurrency
				? new MockV1Pair(ETHBalance.raw, tokenBalance)
				: undefined,
		[ETHBalance, inputCurrency, token, tokenBalance]
	);
}

// returns all v1 exchange addresses in the user's token list
export function useAllTokenV1Exchanges() {
	const allTokens = useAllTokens();
	const factory = useV1FactoryContract();
	const args = useMemo(() => Object.keys(allTokens).map((tokenAddress) => [tokenAddress]), [allTokens]);

	const data = useSingleContractMultipleData(factory, "getExchange", args, NEVER_RELOAD);

	return useMemo(
		() =>
			// @ts-ignore
			data?.reduce((memo, { result }, ix) => {
				if (result?.[0] && result[0] !== AddressZero) {
					memo[result[0]] = allTokens[args[ix][0]];
				}
				return memo;
			}, {}) || {},
		[allTokens, args, data]
	);
}

// returns whether any of the tokens in the user's token list have liquidity on v1
export function useUserHasLiquidityInAllTokens() {
	const { account, chainId } = useActiveWeb3React();

	const exchanges = useAllTokenV1Exchanges();

	const v1ExchangeLiquidityTokens = useMemo(
		() =>
			chainId
				? Object.keys(exchanges).map((address) => new Token(chainId, address, 18, "UNI-V1", "Uniswap V1"))
				: [],
		[chainId, exchanges]
	);

	const balances = useTokenBalances(account || undefined, v1ExchangeLiquidityTokens);

	return useMemo(
		() =>
			Object.keys(balances).some((tokenAddress) => {
				const b = balances[tokenAddress]?.raw;
				return b && JSBI.greaterThan(b, JSBI.BigInt(0));
			}),
		[balances]
	);
}

/**
 * Returns the trade to execute on V1 to go between input and output token
 */
export function useV1Trade(
	isExactIn,
	inputCurrency,
	outputCurrency,
	exactAmount
) {
	// get the mock v1 pairs
	const inputPair = useMockV1Pair(inputCurrency);
	const outputPair = useMockV1Pair(outputCurrency);

	const inputIsETH = inputCurrency === ETHER;
	const outputIsETH = outputCurrency === ETHER;

	// construct a direct or through ETH v1 route
	let pairs = [];
	if (inputIsETH && outputPair) {
		pairs = [outputPair];
	} else if (outputIsETH && inputPair) {
		pairs = [inputPair];
	}
	// if neither are ETH, it's token-to-token (if they both exist)
	else if (inputPair && outputPair) {
		pairs = [inputPair, outputPair];
	}

	const route = inputCurrency && pairs && pairs.length > 0 && new Route(pairs, inputCurrency, outputCurrency);
	let v1Trade;
	try {
		v1Trade =
			route && exactAmount
				? new Trade(route, exactAmount, isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT)
				: undefined;
	} catch (error) {
		console.error("Failed to create V1 trade", error);
	}
	return v1Trade;
}

export function getTradeVersion(trade) {
	const isV1 = trade?.route?.pairs?.some((pair) => pair instanceof MockV1Pair);
	if (isV1) return Version.v1;
	if (isV1 === false) return Version.v2;
	return undefined;
}

// returns the v1 exchange against which a trade should be executed
export function useV1TradeExchangeAddress(trade) {
	const tokenAddress = useMemo(() => {
		if (!trade) return undefined;
		const isV1 = getTradeVersion(trade) === Version.v1;
		if (!isV1) return undefined;
		return trade.inputAmount instanceof TokenAmount
			? trade.inputAmount.token.address
			: trade.outputAmount instanceof TokenAmount
			? trade.outputAmount.token.address
			: undefined;
	}, [trade]);
	return useV1ExchangeAddress(tokenAddress);
}

const ZERO_PERCENT = new Percent("0");
const ONE_HUNDRED_PERCENT = new Percent("1");

// returns whether tradeB is better than tradeA by at least a threshold percentage amount
export function isTradeBetter(
	tradeA,
	tradeB,
	minimumDelta = ZERO_PERCENT
) {
	if (tradeA && !tradeB) return false;
	if (tradeB && !tradeA) return true;
	if (!tradeA || !tradeB) return undefined;

	if (
		tradeA.tradeType !== tradeB.tradeType ||
		!currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
		!currencyEquals(tradeB.outputAmount.currency, tradeB.outputAmount.currency)
	) {
		throw new Error("Trades are not comparable");
	}

	if (minimumDelta.equalTo(ZERO_PERCENT)) {
		return tradeA.executionPrice.lessThan(tradeB.executionPrice);
	}
	return tradeA
		.executionPrice
		.raw
		.multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
		.lessThan(tradeB.executionPrice);
}
