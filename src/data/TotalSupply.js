import { TokenAmount } from "@pancakeswap-libs/sdk";
import { useTokenContract } from "../hooks/useContract";
import { useSingleCallResult } from "../core";

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
export function useTotalSupply(token) {
	const contract = useTokenContract(token?.address, false);

	const totalSupply = useSingleCallResult(contract, "totalSupply")?.result?.[0];

	return token && totalSupply ? new TokenAmount(token, totalSupply.toString()) : undefined;
}

export default useTotalSupply;
