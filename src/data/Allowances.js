import { Token, TokenAmount } from "@annex/sdk";
import { useMemo } from "react";

import { useTokenContract } from "../hooks/useContract";
import { useSingleCallResult } from "../core";

export function useTokenAllowance(token, owner, spender) {
	const contract = useTokenContract(token?.address, false);

	const inputs = useMemo(() => [owner, spender], [owner, spender]);
	const allowance = useSingleCallResult(contract, "allowance", inputs).result;

	return useMemo(() => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined), [
		token,
		allowance,
	]);
}

export default useTokenAllowance;
