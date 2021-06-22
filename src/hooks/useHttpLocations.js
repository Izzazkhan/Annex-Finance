import { useMemo } from "react";
import contenthashToUri from "../utils/contenthashToUri";
import { parseENSAddress } from "../utils/parseENSAddress";
import uriToHttp from "../utils/uriToHttp";
import useENSContentHash from "./useENSContentHash";

export default function useHttpLocations(uri) {
	const ens = useMemo(() => (uri ? parseENSAddress(uri) : undefined), [uri]);
	const resolvedContentHash = useENSContentHash(ens?.ensName);
	return useMemo(() => {
		if (ens) {
			// eslint-disable-next-line max-len
			return resolvedContentHash.contenthash ? uriToHttp(contenthashToUri(resolvedContentHash.contenthash)) : [];
		}
		return uri ? uriToHttp(uri) : [];
	}, [ens, resolvedContentHash.contenthash, uri]);
}
