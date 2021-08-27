import { namehash } from "ethers/lib/utils";
import { useMemo } from "react";
import { useSingleCallResult } from "../core/modules/multicall/hooks";
import isZero from "../utils/isZero";
import { useENSRegistrarContract, useENSResolverContract } from "./useContract";
import useDebounce from "./useDebounce";

/**
 * Does a lookup for an ENS name to find its address.
 */
export default function useENSAddress(ensName) {
	const debouncedName = useDebounce(ensName, 200);
	const ensNodeArgument = useMemo(() => {
		if (!debouncedName) return [undefined];
		try {
			return debouncedName ? [namehash(debouncedName)] : [undefined];
		} catch (error) {
			return [undefined];
		}
	}, [debouncedName]);
	const registrarContract = useENSRegistrarContract(false);
	const resolverAddress = useSingleCallResult(registrarContract, "resolver", ensNodeArgument);
	// console.log(resolverAddress);
	const resolverAddressResult = resolverAddress.result?.[0];
	const resolverContract = useENSResolverContract(
		resolverAddressResult && !isZero(resolverAddressResult) ? resolverAddressResult : undefined,
		false
	);
	const addr = useSingleCallResult(resolverContract, "addr", ensNodeArgument);

	const changed = debouncedName !== ensName;
	return {
		address: changed ? null : addr.result?.[0] || null,
		loading: changed || resolverAddress.loading || addr.loading,
	};
}
