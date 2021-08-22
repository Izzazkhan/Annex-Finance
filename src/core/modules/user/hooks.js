import {useDispatch, useSelector} from "react-redux";
import {useCallback, useMemo} from "react";
import { Token, Pair } from "@annex/sdk";
import _ from 'lodash'
import { userActionCreators } from "./actions";
import {useActiveWeb3React} from "../../../hooks";
import {useAllTokens} from "../../../hooks/Tokens";
import {BASES_TO_TRACK_LIQUIDITY_FOR, PINNED_PAIRS} from "../../../constants/swap";

const { updateUserDeadline, updateUserSlippageTolerance } = userActionCreators


function serializeToken(token) {
	return {
		chainId: token.chainId,
		address: token.address,
		decimals: token.decimals,
		symbol: token.symbol,
		name: token.name,
	};
}

function deserializeToken(serializedToken) {
	return new Token(
		serializedToken.chainId,
		serializedToken.address,
		serializedToken.decimals,
		serializedToken.symbol,
		serializedToken.name
	);
}

export function useUserSlippageTolerance() {
	const dispatch = useDispatch();
	const userSlippageTolerance = useSelector((state) => {
		return state.user.userSlippageTolerance;
	});

	const setUserSlippageTolerance = useCallback(
		(slippageTolerance) => {
			dispatch(updateUserSlippageTolerance({ userSlippageTolerance: slippageTolerance }));
		},
		[dispatch]
	);

	return [userSlippageTolerance, setUserSlippageTolerance];
}

export function useUserDeadline() {
	const dispatch = useDispatch();
	const userDeadline = useSelector((state) => {
		return state.user.userDeadline;
	});

	const setUserDeadline = useCallback(
		(deadline) => {
			dispatch(updateUserDeadline({ userDeadline: deadline }));
		},
		[dispatch]
	);

	return [userDeadline, setUserDeadline];
}


/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken([tokenA, tokenB]) {
	return new Token(tokenA.chainId, Pair.getAddress(tokenA, tokenB), 18, "Cake-LP", "Pancake LPs");
}


/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs() {
	const { chainId } = useActiveWeb3React();
	const tokens = useAllTokens();

	// pinned pairs
	const pinnedPairs = useMemo(() => (chainId ? PINNED_PAIRS[chainId] || [] : []), [chainId]);

	// pairs for every token against every base
	const generatedPairs = useMemo(
		() =>
			chainId
				? _.flatMap(Object.keys(tokens), (tokenAddress) => {
					const token = tokens[tokenAddress];
					// for each token on the current chain,
					return (
						// loop though all bases on the current chain
						(BASES_TO_TRACK_LIQUIDITY_FOR[chainId] || [])
							// to construct pairs of the given token with each base
							.map((base) => {
								if (base.address === token.address) {
									return null;
								}
								return [base, token];
							})
							.filter((p) => p !== null)
				);
				})
				: [],
		[tokens, chainId]
	);

	// pairs saved by users
	const savedSerializedPairs = useSelector(({ user: { pairs } }) => pairs);

	const userPairs = useMemo(() => {
		if (!chainId || !savedSerializedPairs) return [];
		const forChain = savedSerializedPairs[chainId];
		if (!forChain) return [];

		return Object.keys(forChain).map((pairId) => {
			return [deserializeToken(forChain[pairId].token0), deserializeToken(forChain[pairId].token1)];
		});
	}, [savedSerializedPairs, chainId]);


	const combinedList = useMemo(() => userPairs.concat(generatedPairs).concat(pinnedPairs), [
		generatedPairs,
		pinnedPairs,
		userPairs,
	]);

	return useMemo(() => {
		// dedupes pairs of tokens in the combined list
		const keyed = combinedList.reduce((memo, [tokenA, tokenB]) => {
			const sorted = tokenA.sortsBefore(tokenB);
			const key = sorted ? `${tokenA.address}:${tokenB.address}` : `${tokenB.address}:${tokenA.address}`;
			if (memo[key]) return memo;
			memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA];
			return memo;
		}, {});

		return Object.keys(keyed).map((key) => keyed[key]);
	}, [combinedList]);
}
