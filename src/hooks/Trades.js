import { Trade } from "@annex/sdk";
import _ from "lodash";
import { useMemo } from "react";

import { BASES_TO_CHECK_TRADES_AGAINST, CUSTOM_BASES } from "../constants/swap";
import { PairState, usePairs } from "../data/Reserves";
import { wrappedCurrency } from "../utils/wrappedCurrency";

import { useActiveWeb3React } from "./index";

const flatMap = _.flatMap;

function useAllCommonPairs(currencyA, currencyB) {
	const { chainId } = useActiveWeb3React();

	// Base tokens for building intermediary trading routes
	const bases = useMemo(() => (chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []), [chainId]);

	// All pairs from base tokens
	const basePairs = useMemo(
		() =>
			flatMap(bases, (base) => bases.map((otherBase) => [base, otherBase])).filter(
				([t0, t1]) => t0.address !== t1.address
			),
		[bases]
	);

	const [tokenA, tokenB] = chainId
		? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
		: [undefined, undefined];

	const allPairCombinations = useMemo(
		() =>
			tokenA && tokenB
				? [
						// the direct pair
						[tokenA, tokenB],
						// token A against all bases
						...bases.map((base) => [tokenA, base]),
						// token B against all bases
						...bases.map((base) => [tokenB, base]),
						// each base against all bases
						...basePairs,
					// eslint-disable-next-line no-mixed-spaces-and-tabs
				  ]
						.filter((tokens) => Boolean(tokens[0] && tokens[1]))
						.filter(([t0, t1]) => t0.address !== t1.address)
						// This filter will remove all the pairs that are not supported by the CUSTOM_BASES settings
						// This option is currently not used on Pancake swap
						.filter(([t0, t1]) => {
							if (!chainId) return true;
							const customBases = CUSTOM_BASES[chainId];
							if (!customBases) return true;

							const customBasesA = customBases[t0.address];
							const customBasesB = customBases[t1.address];

							if (!customBasesA && !customBasesB) return true;
							if (customBasesA && !customBasesA.find((base) => t1.equals(base))) return false;
							if (customBasesB && !customBasesB.find((base) => t0.equals(base))) return false;

							return true;
						})
				: [],
		[tokenA, tokenB, bases, basePairs, chainId]
	);

	const allPairs = usePairs(allPairCombinations);

	// only pass along valid pairs, non-duplicated pairs
	return useMemo(
		() =>
			Object.values(
				allPairs
					// filter out invalid pairs
					.filter((result) =>
						Boolean(result[0] === PairState.EXISTS && result[1])
					)
					// filter out duplicated pairs
					.reduce((memo, [, curr]) => {
						memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] || curr;
						return memo;
					}, {})
			),
		[allPairs]
	);
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(currencyAmountIn, currencyOut) {
	const allowedPairs = useAllCommonPairs(currencyAmountIn?.currency, currencyOut);

	return useMemo(() => {
		if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
			return (
				Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
					maxHops: 3,
					maxNumResults: 1,
				})[0] || null
			);
		}
		return null;
	}, [allowedPairs, currencyAmountIn, currencyOut]);
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(currencyIn, currencyAmountOut) {
	const allowedPairs = useAllCommonPairs(currencyIn, currencyAmountOut?.currency);

	return useMemo(() => {
		if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
			return (
				Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
					maxHops: 3,
					maxNumResults: 1,
				})[0] || null
			);
		}
		return null;
	}, [allowedPairs, currencyIn, currencyAmountOut]);
}
