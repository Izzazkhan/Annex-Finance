import React from "react";
import { Redirect } from "react-router-dom";
import AddLiquidity from "../AddLiquidity";

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/;
export function RedirectOldAddLiquidityPathStructure(props) {
	const {
		match: {
			params: { currencyIdA },
		},
	} = props;
	const match = currencyIdA.match(OLD_PATH_STRUCTURE);
	if (match?.length) {
		return <Redirect to={`/trade/liquidity/add/${match[1]}/${match[2]}`} />;
	}

	return <AddLiquidity {...props} />;
}

export function RedirectDuplicateTokenIds(props) {
	const {
		match: {
			params: { currencyIdA, currencyIdB },
		},
	} = props;
	if (currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
		return <Redirect to={`/trade/liquidity/add/${currencyIdA}`} />;
	}
	return <AddLiquidity {...props} />;
}
