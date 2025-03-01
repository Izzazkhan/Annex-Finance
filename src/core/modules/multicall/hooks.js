import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useBlockNumber } from "../application";
import {
	multicallActionCreators,
	parseCallKey,
	toCallKey,
} from "./actions";
import { useActiveWeb3React } from "../../../hooks";
import {notNull} from "../../../utils/notNull";

const {
	addMulticallListeners,
	removeMulticallListeners,
} = multicallActionCreators;

function isMethodArg(x) {
	return ["string", "number"].indexOf(typeof x) !== -1;
}

function isValidMethodArgs(x) {
	return (
		x === undefined ||
		(Array.isArray(x) && x.every((xi) => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg))))
	);
}

const INVALID_RESULT = { valid: false, blockNumber: undefined, data: undefined };

// use this options object
export const NEVER_RELOAD = {
	blocksPerFetch: Infinity,
};

// the lowest level call for subscribing to contract data
function useCallsData(calls, options) {
	const { chainId } = useActiveWeb3React();

	const callResults = useSelector(
		(state) => state.multicall.callResults
	);
	const dispatch = useDispatch();

	const serializedCallKeys = useMemo(
		() =>
			JSON.stringify(
				notNull(calls
					?.filter((c) => Boolean(c))
					?.map(toCallKey)
					?.sort(), [])
			),
		[calls]
	);

	// update listeners when there is an actual change that persists for at least 100ms
	useEffect(() => {
		const callKeys = JSON.parse(serializedCallKeys);
		if (!chainId || callKeys.length === 0) return undefined;
		const calls = callKeys.map((key) => parseCallKey(key));
		dispatch(
			addMulticallListeners({
				chainId,
				calls,
				options,
			})
		);

		return () => {
			dispatch(
				removeMulticallListeners({
					chainId,
					calls,
					options,
				})
			);
		};
	}, [chainId, dispatch, options, serializedCallKeys]);

	return useMemo(
		() =>
			// @ts-ignore
			calls.map((call) => {
				if (!chainId || !call) return INVALID_RESULT;

				const result = callResults[chainId]?.[toCallKey(call)];
				const data = result?.data && result?.data !== "0x" ? result.data : null;

				return { valid: true, data, blockNumber: result?.blockNumber };
			}),
		[callResults, calls, chainId]
	);
}

const INVALID_CALL_STATE = { valid: false, result: undefined, loading: false, syncing: false, error: false };
const LOADING_CALL_STATE = { valid: true, result: undefined, loading: true, syncing: true, error: false };

function toCallState(
	callResult,
	contractInterface,
	fragment,
	latestBlockNumber
) {
	if (!callResult) return INVALID_CALL_STATE;
	const { valid, data, blockNumber } = callResult;
	if (!valid) return INVALID_CALL_STATE;
	if (valid && !blockNumber) return LOADING_CALL_STATE;
	if (!contractInterface || !fragment || !latestBlockNumber) return LOADING_CALL_STATE;
	const success = data && data.length > 2;
	const syncing = (notNull(blockNumber, 0)) < latestBlockNumber;
	let result;
	if (success && data) {
		try {
			result = contractInterface.decodeFunctionResult(fragment, data);
		} catch (error) {
			console.error("Result data parsing failed", fragment, data);
			return {
				valid: true,
				loading: false,
				error: true,
				syncing,
				result,
			};
		}
	}
	return {
		valid: true,
		loading: false,
		syncing,
		result,
		error: !success,
	};
}

export function useSingleContractMultipleData(
	contract,
	methodName,
	callInputs,
	options
) {
	const fragment = useMemo(() => contract?.interface?.getFunction(methodName), [contract, methodName]);

	const calls = useMemo(
		() =>
			contract && fragment && callInputs && callInputs.length > 0
				? callInputs.map((inputs) => {
				return {
					address: contract.address,
					callData: contract.interface.encodeFunctionData(fragment, inputs),
				};
			})
				: [],
		[callInputs, contract, fragment]
	);


	const results = useCallsData(calls, options);

	const latestBlockNumber = useBlockNumber();

	return useMemo(() => {
		return results.map((result) => toCallState(result, contract?.interface, fragment, latestBlockNumber));
	}, [fragment, contract, results, latestBlockNumber]);
}

export function useMultipleContractSingleData(
	addresses,
	contractInterface,
	methodName,
	callInputs,
	options
) {
	const fragment = useMemo(() => contractInterface.getFunction(methodName), [contractInterface, methodName]);
	const callData = useMemo(
		() =>
			fragment && isValidMethodArgs(callInputs)
				? contractInterface.encodeFunctionData(fragment, callInputs)
				: undefined,
		[callInputs, contractInterface, fragment]
	);

	const calls = useMemo(
		() =>
			fragment && addresses && addresses.length > 0 && callData
				? addresses.map((address) => {
				return address && callData
					? {
						address,
						callData,
					}
					: undefined;
				})
				: [],
		[addresses, callData, fragment]
	);

	const results = useCallsData(calls, options);

	const latestBlockNumber = useBlockNumber();

	return useMemo(() => {
		return results.map((result) => toCallState(result, contractInterface, fragment, latestBlockNumber));
	}, [fragment, results, contractInterface, latestBlockNumber]);
}

export function useSingleCallResult(
	contract,
	methodName,
	inputs,
	options
) {
	const fragment = useMemo(() => contract?.interface?.getFunction(methodName), [contract, methodName]);

	const calls = useMemo(() => {
		return contract && fragment && isValidMethodArgs(inputs)
			? [
				{
					address: contract.address,
					callData: contract.interface.encodeFunctionData(fragment, inputs),
				},
			]
			: [];
	}, [contract, fragment, inputs]);

	const result = useCallsData(calls, options)[0];
	const latestBlockNumber = useBlockNumber();

	return useMemo(() => {
		return toCallState(result, contract?.interface, fragment, latestBlockNumber);
	}, [result, contract, fragment, latestBlockNumber]);
}
