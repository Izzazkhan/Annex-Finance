import { useMemo } from "react";
import { useAllTokenBalances } from "../../../hooks/wallet";

// compare two token amounts with highest one coming first
function balanceComparator(balanceA, balanceB) {
	if (balanceA && balanceB) {
		return balanceA.greaterThan(balanceB) ? -1 : balanceA.equalTo(balanceB) ? 0 : 1;
	}
	if (balanceA && balanceA.greaterThan("0")) {
		return -1;
	}
	if (balanceB && balanceB.greaterThan("0")) {
		return 1;
	}
	return 0;
}

function getTokenComparator(balances) {
	return function sortTokens(tokenA, tokenB) {
		// -1 = a is first
		// 1 = b is first

		// sort by balances
		const balanceA = balances[tokenA.address];
		const balanceB = balances[tokenB.address];

		const balanceComp = balanceComparator(balanceA, balanceB);
		if (balanceComp !== 0) return balanceComp;

		if (tokenA.symbol && tokenB.symbol) {
			// sort by symbol
			return tokenA.symbol.toLowerCase() < tokenB.symbol.toLowerCase() ? -1 : 1;
		}
		return tokenA.symbol ? -1 : tokenB.symbol ? -1 : 0;
	};
}

export function useTokenComparator(inverted) {
	const balances = useAllTokenBalances();
	const comparator = useMemo(() => getTokenComparator(balances || {}), [balances]);
	return useMemo(() => {
		if (inverted) {
			return (tokenA, tokenB) => comparator(tokenA, tokenB) * -1;
		}
		return comparator;
	}, [inverted, comparator]);
}

export default useTokenComparator;
