import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useDebounce from "../../../hooks/useDebounce";
import useIsWindowVisible from "../../../hooks/useIsWindowVisible";
import { applicationActionCreators } from "./actions";
import { useActiveWeb3React } from "../../../hooks";

const { updateBlockNumber } = applicationActionCreators;

export default function Updater() {
	const { chainId, library } = useActiveWeb3React();
	const dispatch = useDispatch();

	const windowVisible = useIsWindowVisible();

	const [state, setState] = useState({
		chainId,
		blockNumber: null,
	});

	const blockNumberCallback = useCallback(
		(blockNumber) => {
			setState((s) => {
				if (chainId === s.chainId) {
					if (typeof s.blockNumber !== "number") return { chainId, blockNumber };
					return { chainId, blockNumber: Math.max(blockNumber, s.blockNumber) };
				}
				return s;
			});
		},
		[chainId, setState]
	);

	// attach/detach listeners
	useEffect(() => {
		if (!library || !chainId || !windowVisible) return undefined;

		setState({ chainId, blockNumber: null });

		library
			.getBlockNumber()
			.then(blockNumberCallback)
			.catch((error) => console.error(`Failed to get block number for chainId: ${chainId}`, error));

		library.on("block", blockNumberCallback);
		return () => {
			library.removeListener("block", blockNumberCallback);
		};
	}, [dispatch, chainId, library, blockNumberCallback, windowVisible]);

	const debouncedState = useDebounce(state, 100);

	useEffect(() => {
		if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return;
		dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }));
	}, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId]);

	return null;
}