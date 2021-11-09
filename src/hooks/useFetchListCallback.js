import { nanoid } from "@reduxjs/toolkit";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { listActionCreators } from "../core/modules/lists/actions";
import getTokenList from "../utils/getTokenList";
import resolveENSContentHash from "../utils/resolveENSContentHash";
import { useActiveWeb3React } from "./index";

const { fetchTokenList } = listActionCreators;

export function useFetchListCallback() {
	const { chainId, library } = useActiveWeb3React();
	const dispatch = useDispatch();

	const ensResolver = useCallback(
		(ensName) => {
			return resolveENSContentHash(ensName, library);
		},
		[chainId, library]
	);

	return useCallback(
		async (listUrl) => {
			const requestId = nanoid();
			dispatch(fetchTokenList.pending({ requestId, url: listUrl }));
			return getTokenList(listUrl, ensResolver)
				.then((tokenList) => {
					dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }));
					return tokenList;
				})
				.catch((error) => {
					console.error(`Failed to get list at url ${listUrl}`, error);
					dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message }));
					throw error;
				});
		},
		[dispatch, ensResolver]
	);
}

export default useFetchListCallback;
